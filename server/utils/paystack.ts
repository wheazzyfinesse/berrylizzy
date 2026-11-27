import type { Request, Response } from "express";
import Order from "../models/orders.js";
import { Types } from "mongoose";
import { releaseStock } from "../controllers/orderControllers.js";
import { randomUUID } from "node:crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

type PaystackInitializeResponse = {
	status: boolean;
	message: string;
	data?: {
		authorization_url: string;
		reference: string;
	};
};

export async function initializePaystackPaymentCheckout({
	amountInNaira,
	email,
	orderId,
	reference,
}: {
	amountInNaira: number;
	email: string;
	orderId: string;
	reference?: string;
}) {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("PAYSTACK_SECRET_KEY is not configured");
	}

	const response = await fetch(
		"https://api.paystack.co/transaction/initialize",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: String(Math.round(amountInNaira * 100)), // Paystack expects kobo
				email,
				currency: "NGN",
				callback_url: `${process.env.PUBLIC_API_URL}/api/orders/payments/verify/paystack/callback`,
				metadata: { orderId, reference },
			}),
		},
	);

	const result = (await response.json()) as PaystackInitializeResponse;

	if (!response.ok || !result.status || !result.data) {
		throw new Error(
			result.message || "Could not initialize Paystack Payment Checkout",
		);
	}

	return result.data;
}

const paymentResultPage = (title: string, message: string) => `
  <!doctype html>
  <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
    <body style="font-family: sans-serif; padding: 2rem">
      <h1>${title}</h1>
      <p>${message}</p>
      <p>Return to BerryLizzy to view your order.</p>
    </body>
  </html>
`;

export const verifyPaystackPaymentCallback = async (
	req: Request,
	res: Response,
) => {
	const reference =
		typeof req.query.reference === "string"
			? req.query.reference
			: typeof req.query.trxref === "string"
				? req.query.trxref
				: null;

	if (!reference) {
		return res.status(400).send("Payment reference is required");
	}

	try {
		const order = await Order.findOne({
			paymentAttempts: { $elemMatch: { reference } },
			paymentMethod: "paystack",
		});

		if (!order) {
			return res
				.status(404)
				.type("html")
				.send(
					paymentResultPage(
						"Order not found",
						"We couldn't match this payment to an order.",
					),
				);
		}
		const attempt = order?.paymentAttempts.find(
			(item) => item.reference === reference,
		);
		if (!attempt) {
			return res.status(404).send("Payment attempt not found");
		}
		if (order.paymentStatus !== "paid") {
			const secret = process.env.PAYSTACK_SECRET_KEY;
			if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

			const response = await fetch(
				`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
				{ headers: { Authorization: `Bearer ${secret}` } },
			);

			const result: any = await response.json();
			const transaction = result?.data;

			const valid =
				response.ok &&
				result?.status === true &&
				transaction?.status === "success" &&
				transaction.reference === attempt?.reference &&
				transaction.amount === Math.round(order.totalAmount * 100) &&
				transaction.currency === "NGN" &&
				transaction.metadata?.orderId === String(order._id);

			if (!valid) {
				return res
					.status(200)
					.type("html")
					.send(
						paymentResultPage(
							"Payment not confirmed",
							"Return to the app and check your order status.",
						),
					);
			}

			order.paymentStatus = "paid";
			attempt.status = "paid";
			order.stockReserved = false;
			order.reservationExpiresAt = null;
			await order.save();
		}

		return res
			.status(200)
			.type("html")
			.send(
				paymentResultPage(
					"Payment confirmed",
					"Return to the app to view your order.",
				),
			);
	} catch (error) {
		console.error("Paystack callback verification failed:", error);
		return res
			.status(502)
			.type("html")
			.send(
				paymentResultPage(
					"Could not verify payment",
					"Return to the app and try checking your order again.",
				),
			);
	}
};

// POST /api/orders/:id/cancel
export const cancelMyOrderWithRefund = async (req: Request, res: Response) => {
	const orderId = req.params.id;

	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
		return res.status(400).json({ message: "Invalid order ID" });
	}

	try {
		const order = await Order.findOne({
			_id: orderId,
			user: req.user._id,
		});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.orderStatus === "cancelled") {
			return res.status(200).json(order); // Already cancelled
		}

		if (["shipped", "delivered"].includes(order.orderStatus)) {
			return res
				.status(409)
				.json({ message: "This order can no longer be cancelled" });
		}
		const paidAttempt = order.paymentAttempts.find(
			(attempt) => attempt.status === "paid",
		);
		if (order.paymentStatus === "paid") {
			if (order.paymentMethod !== "paystack" || !paidAttempt?.reference) {
				return res.status(409).json({
					message: "This paid order needs a refund to be handled manually",
				});
			}

			if (order.refundStatus !== "not_requested") {
				return res.status(202).json({
					success: true,
					message: "Refund is already being handled",
					data: order,
				});
			}

			const secret = process.env.PAYSTACK_SECRET_KEY;
			if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

			const refundReference = `order-refund-${order._id}`;

			const response = await fetch("https://api.paystack.co/refund", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${secret}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					transaction: paidAttempt.reference,
					reference: refundReference,
					currency: "NGN",
					customer_note: "Refund for cancelled order",
				}),
			});

			const result: any = await response.json();

			if (!response.ok || !result.status) {
				return res.status(502).json({
					success: false,
					message: result.message || "Could not initiate refund",
				});
			}

			order.orderStatus = "cancelled";
			order.refundReference = refundReference;
			order.refundStatus = result.data.status || "pending";
			await order.save();

			return res.status(202).json({
				success: true,
				message: "Order cancelled; refund is being processed",
				data: order,
			});
		}

		// Unpaid orders can be cancelled directly.
		order.orderStatus = "cancelled";
		await order.save();
		await releaseStock(order);

		return res.status(200).json({ success: true, data: order });
	} catch (error) {
		console.error("Customer order cancellation failed:", error);
		return res.status(500).json({ message: "Could not cancel order" });
	}
};

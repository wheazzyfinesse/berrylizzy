import type { Request, Response } from "express";
import Order from "../models/orders.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

type PaystackInitializeResponse = {
	status: boolean;
	message: string;
	data?: {
		authorization_url: string;
		reference: string;
	};
};

export async function initializePaystackCheckout({
	amountInNaira,
	email,
	orderId,
}: {
	amountInNaira: number;
	email: string;
	orderId: string;
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
				callback_url: `${process.env.PUBLIC_API_URL}/api/orders/payments/paystack/callback`,
				metadata: { orderId },
			}),
		},
	);

	const result = (await response.json()) as PaystackInitializeResponse;

	if (!response.ok || !result.status || !result.data) {
		throw new Error(result.message || "Could not initialize Paystack checkout");
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

export const paystackCallback = async (req: Request, res: Response) => {
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
			paymentReference: reference,
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
				transaction.reference === order.paymentReference &&
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

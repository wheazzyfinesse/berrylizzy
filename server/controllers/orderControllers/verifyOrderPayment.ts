import type { Request, Response } from "express";
import Order from "../../models/orders.js";
import { paymentResultPage } from "../../utils/ui/paymentResultPage.js";
import verifyPaystackPayment from "../../utils/paystack/verifyPaystackPayment.js";

const verifyOrderPayment = async (req: Request, res: Response) => {
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
			const { response, result } = await verifyPaystackPayment(reference);
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

export default verifyOrderPayment;

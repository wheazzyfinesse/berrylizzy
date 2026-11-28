import type { Request, Response } from "express";
import { Types } from "mongoose";
import { paymentResultPage } from "../ui/paymentResultPage.js";
import Order from "../../models/orders.js";
import verifyPaystackPayment from "./verifyPaystackPayment.js";
import releaseStock from "../../controllers/orderControllers/releaseStock.js";
export const paystackCancel = async (req: Request, res: Response) => {
	const { orderId, reference } = req.query;

	const sendPage = (status: number, title: string, message: string) =>
		res.status(status).type("html").send(paymentResultPage(title, message));

	if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
		return sendPage(
			400,
			"Invalid order",
			"Return to the app and check your order.",
		);
	}

	if (typeof reference !== "string" || !reference.trim()) {
		return sendPage(
			400,
			"Payment reference missing",
			"Return to the app and check your order.",
		);
	}

	try {
		const order = await Order.findOne({
			_id: orderId,
			paymentMethod: "paystack",
			"paymentAttempts.reference": reference,
		});

		if (!order) {
			return sendPage(
				404,
				"Order not found",
				"Return to the app to check your orders.",
			);
		}

		const attempt = order.paymentAttempts.find(
			(item) => item.reference === reference,
		);

		if (!attempt) {
			return sendPage(
				404,
				"Payment attempt not found",
				"Return to the app to check your order.",
			);
		}

		const { response, result } = await verifyPaystackPayment(reference);

		if (!response.ok || !result.status) {
			// Keep the requested plain-text JSON response for this error.
			return res
				.status(503)
				.json(
					"Could not confirm payment status. Check the order again shortly.",
				);
		}

		const transaction = result.data;

		const transactionMatchesOrder =
			transaction.reference === reference &&
			transaction.amount === Math.round(order.totalAmount * 100) &&
			transaction.currency === "NGN" &&
			transaction.metadata?.orderId === String(order._id);

		if (!transactionMatchesOrder) {
			return sendPage(
				409,
				"Payment could not be matched",
				"Return to the app and contact support if your account was charged.",
			);
		}

		if (transaction.status === "success") {
			attempt.status = "paid";
			order.paymentStatus = "paid";
			order.stockReserved = false;
			order.reservationExpiresAt = null;
			await order.save();

			return sendPage(
				200,
				"Payment confirmed",
				"Return to the app to view your order.",
			);
		}

		if (transaction.status === "abandoned" || transaction.status === "failed") {
			attempt.status = transaction.status;

			const hasPaidAttempt = order.paymentAttempts.some(
				(item) => item.status === "paid",
			);

			const hasUnresolvedAttempt = order.paymentAttempts.some(
				(item) => item.status === "initializing" || item.status === "pending",
			);

			if (hasPaidAttempt) {
				order.paymentStatus = "paid";
			} else if (hasUnresolvedAttempt) {
				order.paymentStatus = "pending";
			} else {
				order.paymentStatus = "failed";
			}

			await order.save();

			if (!hasPaidAttempt && !hasUnresolvedAttempt && order.stockReserved) {
				// This helper must restore stock only once and clear the reservation.
				await releaseStock(order);
			}

			return sendPage(
				200,
				transaction.status === "abandoned"
					? "Payment cancelled"
					: "Payment failed",
				"Return to the app to check your order or try payment again.",
			);
		}

		// For pending, ongoing, or processing, don't mark the attempt failed.
		return sendPage(
			200,
			"Payment not confirmed",
			"The payment may still be processing. Return to the app and check your order.",
		);
	} catch (error) {
		console.error("Could not handle Paystack cancellation:", error);

		return res
			.status(503)
			.json("Could not confirm payment status. Check the order again shortly.");
	}
};

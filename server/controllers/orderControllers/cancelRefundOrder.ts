import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../../models/orders.js";
import restockPaidOrderOnce from "./restockPaidOrderOnce.js";
import releaseStock from "./releaseStock.js";
import verifyPaystackRefund from "../../utils/paystack/verifyPaystackRefund.js";
import refundPaystackPayment from "../../utils/paystack/refundPaystackPayment.js";

const cancelRefundOrder = async (req: Request, res: Response) => {
	const orderId = req.params.id;

	if (!req.user) {
		return res.status(401).json("Unauthorized");
	}

	if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
		return res.status(400).json("Invalid order ID");
	}

	try {
		const order = await Order.findOne({
			_id: orderId,
			user: req.user._id,
		});

		if (!order) {
			return res.status(404).json("Order not found");
		}

		if (["shipped", "delivered"].includes(order.orderStatus)) {
			return res.status(409).json("This order can no longer be cancelled");
		}
		// Already cancelled unpaid orders need no further work.
		if (
			order.orderStatus === "cancelled" &&
			["pending", "failed"].includes(order.paymentStatus) &&
			!order.stockReserved
		) {
			return res.status(200).json("Order is already cancelled");
		}

		// A completed refund is idempotent: never issue it again.
		if (order.paymentStatus === "refunded") {
			if (order.orderStatus !== "cancelled") {
				order.orderStatus = "cancelled";
				await order.save();
			}

			await restockPaidOrderOnce(order._id);

			return res.status(200).json("This order has already been refunded");
		}

		// Unpaid orders are cancelled without a refund.
		if (order.paymentStatus === "pending" || order.paymentStatus === "failed") {
			const unresolvedAttempt = order.paymentAttempts.some((attempt) =>
				["initializing", "awaiting_payment", "pending"].includes(
					attempt.status,
				),
			);

			if (order.paymentMethod === "paystack" && unresolvedAttempt) {
				return res
					.status(409)
					.json(
						"A Paystack payment attempt is unresolved. Check its status before cancelling.",
					);
			}

			if (order.stockReserved) {
				await releaseStock(order);
			}

			order.orderStatus = "cancelled";
			order.reservationExpiresAt = null;
			await order.save();

			return res
				.status(200)
				.json("Unpaid order cancelled; no refund was needed");
		}

		// A paid cash order has no Paystack transaction to refund automatically.
		if (order.paymentStatus === "paid" && order.paymentMethod !== "paystack") {
			return res
				.status(409)
				.json("This paid cash order requires a manual refund");
		}

		if (order.paymentStatus !== "paid") {
			return res
				.status(409)
				.json("This order's payment status cannot be cancelled automatically");
		}

		const paidAttempt = order.paymentAttempts.find(
			(attempt) => attempt.status === "paid",
		);

		if (!paidAttempt?.reference) {
			return res
				.status(409)
				.json("A successful Paystack payment attempt was not found");
		}

		switch (order.refundStatus) {
			case "pending":
			case "processing":
			case "needs-attention":
				return res.status(202).json("The refund is already being handled");

			case "processed":
				order.paymentStatus = "refunded";
				order.orderStatus = "cancelled";
				await order.save();
				await restockPaidOrderOnce(order._id);

				return res.status(200).json("This order has already been refunded");

			case "initiating":
			case "not_requested":
			case "failed":
				break;

			default:
				return res
					.status(409)
					.json("The refund status is unknown; contact support");
		}

		// Reuse the reference for an unresolved initialization.
		// Use a new one only after Paystack has confirmed a previous refund failed.
		let refundReference: string;

		if (order.refundStatus === "initiating") {
			// Reuse the reference: the previous request may have timed out.
			if (!order.refundReference) {
				throw new Error("Refund is initiating but has no saved reference");
			}

			refundReference = order.refundReference;
		} else if (order.refundStatus === "failed") {
			// Paystack already used the previous reference, so create a new one.
			refundReference = `refund-${order._id}-${randomUUID().replaceAll("-", "")}`;
		} else {
			// First refund request.
			refundReference = order.refundReference ?? `refund-${order._id}`;
		}

		order.refundReference = refundReference;
		order.refundStatus = "initiating";
		await order.save();

		// A previous request may have reached Paystack even if your server timed out.
		// Check first; if none exists, submit using the same reference.
		let refund = await verifyPaystackRefund(refundReference);

		if (!refund) {
			const paidAttemptReference = paidAttempt.reference;
			const { response, result } = await refundPaystackPayment({
				paidAttemptReference,
				refundReference,
			});

			if (response.status === 409) {
				// Paystack says this reference already exists. Retrieve that refund.
				refund = await verifyPaystackRefund(refundReference);
			} else if (!response.ok || result?.status !== true) {
				order.refundStatus = "failed";
				order.orderStatus = "cancelled";
				await order.save();
				await restockPaidOrderOnce(order._id);

				return res.status(502).json({
					success: false,
					message:
						result?.message ||
						"Order cancelled, but the refund could not be initiated. Contact support.",
					data: order,
				});
			} else {
				refund = result.data;
			}
		}

		if (!refund) {
			// Leave it as initiating so a later request can reconcile this reference.
			return res.status(202).json("Refund request is being reconciled");
		}

		order.orderStatus = "cancelled";
		order.refundReference = refundReference;
		order.refundStatus = refund.status;

		if (refund.status === "processed") {
			order.paymentStatus = "refunded";
		}

		await order.save();
		await restockPaidOrderOnce(order._id);

		if (refund.status === "failed") {
			return res
				.status(502)
				.json(
					"The order was cancelled, but Paystack reports that the refund failed. Contact support.",
				);
		}

		return res
			.status(202)
			.json(
				refund.status === "processed"
					? "Order cancelled and refund processed"
					: "Order cancelled; refund is being processed",
			);
	} catch (error) {
		console.error("Customer order cancellation failed:", error);
		return res.status(500).json("Could not complete the cancellation request");
	}
};

export default cancelRefundOrder;

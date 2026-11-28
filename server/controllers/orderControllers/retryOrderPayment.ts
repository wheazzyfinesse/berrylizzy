import type { Request, Response } from "express";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import Order from "../../models/orders.js";
import initializePaystackPayment from "../../utils/paystack/initializePaystackPayment.js";
import verifyPaystackPayment from "../../utils/paystack/verifyPaystackPayment.js";

const unresolvedAttemptStatuses = [
	"initializing",
	"pending",
	"awaiting_payment",
];

export const retryOrderPayment = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order ID" });
		}

		const order = await Order.findOne({
			_id: id,
			user: req.user._id,
		});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (
			order.orderStatus !== "placed" ||
			order.paymentMethod !== "paystack" ||
			!["pending", "failed"].includes(order.paymentStatus)
		) {
			return res
				.status(409)
				.json("This order cannot be paid again. Please place a new order.");
		}

		if (
			!order.stockReserved ||
			!order.reservationExpiresAt ||
			order.reservationExpiresAt <= new Date()
		) {
			return res
				.status(409)
				.json("The stock reservation expired. Please place a new order.");
		}

		// Reconcile an existing attempt before creating another.
		const activeAttempt = order.paymentAttempts.find((attempt) =>
			unresolvedAttemptStatuses.includes(attempt.status),
		);

		if (activeAttempt) {
			const { response, result } = await verifyPaystackPayment(
				activeAttempt.reference,
			);
			const transaction = result?.data;

			if (!response.ok || result?.status !== true || !transaction) {
				return res.status(502).json({
					message:
						"Could not verify the previous payment attempt. Check again shortly.",
				});
			}

			if (transaction.status === "success") {
				const valid =
					transaction.reference === activeAttempt.reference &&
					transaction.amount === Math.round(order.totalAmount * 100) &&
					transaction.currency === "NGN" &&
					transaction.metadata?.orderId === String(order._id);

				if (!valid) {
					return res.status(409).json({
						message: "The existing payment could not be safely verified.",
					});
				}

				activeAttempt.status = "paid";
				order.paymentStatus = "paid";
				order.stockReserved = false;
				order.reservationExpiresAt = null;
				await order.save();

				return res.status(409).json("This order has already been paid.");
			}

			if (
				transaction.status === "failed" ||
				transaction.status === "abandoned"
			) {
				activeAttempt.status = transaction.status;
				order.paymentStatus = "failed";
				await order.save();

				// The attempt is terminal, so continue and create a fresh checkout.
			} else if (
				["pending", "ongoing", "processing"].includes(transaction.status)
			) {
				// There may still be a live checkout. Return its URL so the app can
				// let the customer continue instead of creating another attempt.
				if (!activeAttempt.authorizationUrl) {
					return res.status(409).json({
						message:
							"The payment is still being initialized. Check the order again shortly.",
					});
				}

				return res.status(200).json({
					order,
					authorization_url: activeAttempt.authorizationUrl,
					reference: activeAttempt.reference,
					continueExistingAttempt: true,
				});
			} else {
				return res
					.status(409)
					.json(`The previous payment is unresolved (${transaction.status}).`);
			}
		}

		const reference = `retry-${order._id}-${randomUUID().replaceAll("-", "")}`;

		// Persist the reference before contacting Paystack, so a timeout can be
		// reconciled against this same reference on the next request.
		order.paymentAttempts.push({
			requestedReference: reference,
			reference,
			authorizationUrl: "",
			status: "initializing",
			createdAt: new Date(),
		});
		order.paymentStatus = "pending";
		await order.save();

		let checkout;

		try {
			const { response, result } = await initializePaystackPayment({
				amountInNaira: order.totalAmount,
				email: req.user.email,
				orderId: String(order._id),
				reference,
			});

			if (!response.ok || result?.status !== true || !result.data) {
				throw new Error(
					result?.message || "Paystack did not initialize the payment",
				);
			}

			checkout = result.data;

			if (checkout.reference !== reference) {
				throw new Error("Paystack returned a different payment reference");
			}
		} catch (error) {
			console.error("Paystack checkout initialization failed:", error);

			return res
				.status(502)
				.json(
					"Could not confirm checkout initialization. Check the order before retrying.",
				);
		}

		const newAttempt = order.paymentAttempts.find(
			(attempt) => attempt.reference === checkout.reference,
		);

		if (!newAttempt) {
			throw new Error("Payment attempt was not saved");
		}

		newAttempt.status = "pending";
		newAttempt.authorizationUrl = checkout.authorization_url;
		await order.save();

		return res.status(200).json({
			order,
			authorization_url: checkout.authorization_url,
			reference: checkout.reference,
			continueExistingAttempt: false,
		});
	} catch (error) {
		console.error("Retry payment failed:", error);

		return res
			.status(500)
			.json(
				"Could not retry payment. Check the order status before trying again.",
			);
	}
};

import type { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../models/orders.js";
import { randomUUID } from "crypto";
import { initializePaystackPaymentCheckout } from "./paystack.js";

export const retryOrderPayment = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (!req.user) {
			return res.status(401).json("Unauthorized");
		}

		if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
			return res.status(400).json("Invalid order ID");
		}

		const order = await Order.findOne({
			_id: id,
			user: req.user._id,
		});

		if (!order) {
			return res.status(404).json("Order not found");
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

		// Don’t create another checkout while an earlier attempt may still succeed.
		const activeAttempt = order.paymentAttempts.find(
			(attempt) =>
				attempt.status === "initializing" || attempt.status === "pending",
		);

		if (activeAttempt) {
			const secret = process.env.PAYSTACK_SECRET_KEY;

			if (!secret) {
				throw new Error("PAYSTACK_SECRET_KEY is not configured");
			}

			const verifyResponse = await fetch(
				`https://api.paystack.co/transaction/verify/${encodeURIComponent(
					activeAttempt.reference,
				)}`,
				{
					headers: { Authorization: `Bearer ${secret}` },
				},
			);

			const verifyResult: any = await verifyResponse.json();
			const transaction = verifyResult?.data;

			if (!verifyResponse.ok || verifyResult?.status !== true || !transaction) {
				return res.status(502).json({
					message:
						"Could not verify the previous payment attempt. Try again shortly.",
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

				return res.status(409).json({
					message: "This order has already been paid.",
					data: order,
				});
			}

			if (
				transaction.status === "failed" ||
				transaction.status === "abandoned"
			) {
				activeAttempt.status = transaction.status;
				order.paymentStatus = "failed";
				await order.save();

				// Continue below to create the new payment attempt.
			} else {
				// For example: pending, ongoing, or processing.
				return res.status(409).json({
					message: `The previous payment is still unresolved (${transaction.status}).`,
				});
			}
		}

		const reference = `retry-${order._id}-${randomUUID()}`;

		// Save before calling Paystack. If the request times out, this reference
		// can still be checked instead of creating an untracked payment.
		order.paymentAttempts.push({
			reference,
			status: "initializing",
			createdAt: new Date(),
		});
		order.paymentStatus = "pending";
		await order.save();

		const checkout = await initializePaystackPaymentCheckout({
			amountInNaira: order.totalAmount,
			email: req.user.email,
			orderId: String(order._id),
			reference,
		});

		const attempt = order.paymentAttempts.find(
			(item) => item.reference === reference,
		);

		if (!attempt) {
			throw new Error("Payment attempt was not saved");
		}

		attempt.status = "pending";
		await order.save();

		return res.status(200).json({
			order,
			authorization_url: checkout.authorization_url,
			reference,
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

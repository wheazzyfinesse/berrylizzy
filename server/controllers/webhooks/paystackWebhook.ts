import type { Request, Response } from "express";
import Order from "../../models/orders.js";
import getRefundStatus from "../../utils/paystack/getRefundStatus.js";
import {
	verifyCurrentSignature,
	verifyLegacySignature,
} from "../../utils/paystack/paystackWebhookUtils.js";
import type { PaystackRefundEvent } from "../../utils/paystack/paystackTypes.js";

export const paystackWebhook = async (req: Request, res: Response) => {
	const rawBody = req.body;
	if (!Buffer.isBuffer(rawBody)) {
		return res.status(400).send("Expected raw webhook body");
	}

	const currentSignature = req.get("paystack-signature");
	const legacySignature = req.get("x-paystack-signature");
	const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
	const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

	const validSignature = currentSignature
		? Boolean(
				webhookSecret &&
				verifyCurrentSignature(rawBody, currentSignature, webhookSecret),
			)
		: Boolean(
				legacySignature &&
				paystackSecret &&
				verifyLegacySignature(rawBody, legacySignature, paystackSecret),
			);

	if (!validSignature) {
		return res.status(401).send("Invalid Paystack signature");
	}

	let event: PaystackRefundEvent;

	try {
		event = JSON.parse(rawBody.toString("utf8")) as PaystackRefundEvent;
	} catch {
		return res.status(400).send("Invalid JSON");
	}

	const refundStatus = getRefundStatus(event.event ?? "");
	if (!refundStatus) {
		// Acknowledge other valid Paystack events you are not handling here.
		return res.sendStatus(200);
	}

	const refundReference = event.data?.refund_reference;
	const transactionReference = event.data?.transaction_reference;

	if (!refundReference && !transactionReference) {
		console.error("Refund webhook has no usable reference", event);
		return res.sendStatus(200);
	}

	try {
		// Prefer the refund reference that your app saved when requesting the refund.
		let order = refundReference
			? await Order.findOne({ refundReference })
			: null;

		// Some refund events may not include refund_reference. Fall back to the
		// original successful Paystack transaction reference.
		if (!order && transactionReference) {
			order = await Order.findOne({
				paymentMethod: "paystack",
				paymentAttempts: {
					$elemMatch: {
						reference: transactionReference,
						status: "paid",
					},
				},
			});
		}

		if (!order) {
			console.warn("No order matched Paystack refund event", {
				refundReference,
				transactionReference,
			});

			// Acknowledge it so Paystack doesn't keep retrying an event we cannot map.
			return res.sendStatus(200);
		}

		// Ignore an older refund event if the order now has a different refund ref.
		if (
			refundReference &&
			order.refundReference &&
			order.refundReference !== refundReference
		) {
			return res.sendStatus(200);
		}

		// Don't let a delayed earlier event downgrade an already processed refund.
		if (order.refundStatus !== "processed") {
			order.refundStatus = refundStatus as typeof order.refundStatus;

			if (refundReference && !order.refundReference) {
				order.refundReference = refundReference;
			}

			if (refundStatus === "processed") {
				order.paymentStatus = "refunded";
			}

			// On refund.failed, leave paymentStatus as "paid":
			// the customer was not refunded.
			await order.save();
		}

		return res.sendStatus(200);
	} catch (error) {
		console.error(
			"Could not update order from Paystack refund webhook:",
			error,
		);

		// Non-200 tells Paystack delivery failed, allowing a retry.
		return res.sendStatus(500);
	}
};

import type { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../../models/orders.js";
import releaseStock from "./releaseStock.js";

// PUT /api/orders/:id — admin may update fulfillment fields, never payment fields
const updateOrder = async (req: Request, res: Response) => {
	const orderId = req.params.id;
	console.log(orderId);
	try {
		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json("Invalid order ID");
		}

		const allowedStatuses = [
			"placed",
			"processing",
			"shipped",
			"delivered",
			"cancelled",
		];
		const orderStatus = req.body.orderStatus;

		if (orderStatus !== undefined && !allowedStatuses.includes(orderStatus)) {
			return res.status(400).json("Invalid order status");
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json("Order not found");

		if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
			return res
				.status(409)
				.json("A paid order cannot be cancelled except by the customer");
		}

		if (
			order.paymentStatus !== "paid" &&
			orderStatus !== undefined &&
			orderStatus !== "cancelled"
		) {
			return res.status(409).json("An unpaid order can only be cancelled");
		}

		if (orderStatus !== undefined) order.orderStatus = orderStatus;

		if (orderStatus === "delivered") {
			order.deliveredAt = new Date();
			order.stockReserved = false;
			order.reservationExpiresAt = null;
		}

		await order.save();

		if (orderStatus === "cancelled") {
			await releaseStock(order);
		}

		return res.status(200).json(order);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not update order");
	}
};

export default updateOrder;

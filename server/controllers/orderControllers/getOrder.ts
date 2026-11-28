import type { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../../models/orders.js";

// GET /api/orders/:id — owner or admin
const getOrder = async (req: Request, res: Response) => {
	const orderId = req.params.id;
	try {
		if (!req.user) return res.status(401).json("Unauthorized");

		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json("Invalid order ID");
		}

		const order = await Order.findById(req.params.id)
			.populate("user", "name email")
			.populate("orderItems.productId", "name images");

		if (!order) return res.status(404).json("Order not found");

		const ownerId = String((order.user as any)?._id ?? order.user);

		if (ownerId !== String(req.user._id) && req.user.role !== "admin") {
			return res.status(403).json("You cannot access this order");
		}

		return res.status(200).json(order);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get order");
	}
};

export default getOrder;

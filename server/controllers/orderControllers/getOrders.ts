import type { Request, Response } from "express";

import Order from "../../models/orders.js";

// GET /api/orders — admin only
const getOrders = async (_req: Request, res: Response) => {
	try {
		const orders = await Order.find()
			.populate("user", "name email")
			.populate("orderItems.productId", "name images")
			.sort({ createdAt: -1 });

		return res.status(200).json(orders);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get orders");
	}
};

export default getOrders;

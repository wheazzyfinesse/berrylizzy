import Order from "../../models/orders.js";
import type { Request, Response } from "express";
// GET /api/orders/mine
export async function getMyOrders(req: Request, res: Response) {
	try {
		if (!req.user) return res.status(401).json("Unauthorized");

		const orders = await Order.find({ user: req.user._id })
			.sort({
				createdAt: -1,
			})
			.populate("orderItems.productId", "name images");

		return res.status(200).json(orders);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get your orders");
	}
}

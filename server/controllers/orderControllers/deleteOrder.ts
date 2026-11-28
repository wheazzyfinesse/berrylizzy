import Order from "../../models/orders.js";
import type { Request, Response } from "express";
import releaseStock from "./releaseStock.js";
import { Types } from "mongoose";

// DELETE /api/orders/:id — admin; paid orders are retained
const deleteOrder = async (req: Request, res: Response) => {
	const orderId = req.params.id;

	try {
		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json("Invalid order ID");
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		if (order.paymentStatus === "paid") {
			return res.status(409).json("Paid orders cannot be deleted");
		}

		await releaseStock(order);
		await order.deleteOne();

		return res.status(200).json("Order deleted");
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not delete order");
	}
};

export default deleteOrder;

import type { Types } from "mongoose";
import Order from "../../models/orders.js";
import mongoose from "mongoose";
import Product from "../../models/products.js";

const restockPaidOrderOnce = async (orderId: Types.ObjectId | string) => {
	const session = await mongoose.startSession();

	try {
		await session.withTransaction(async () => {
			const order = await Order.findById(orderId).session(session);

			if (!order || order.stockRestocked) return;

			for (const item of order.orderItems) {
				await Product.updateOne(
					{ _id: item.productId },
					{ $inc: { stock: item.quantity } },
					{ session },
				);
			}

			order.stockRestocked = true;
			await order.save({ session });
		});
	} finally {
		await session.endSession();
	}
};

export default restockPaidOrderOnce;

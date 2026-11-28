import Order from "../../models/orders.js";
import Product from "../../models/products.js";

// Release reserved stock for a cancelled or expired order.
const releaseStock = async (order: any) => {
	// Flip the flag first, so repeated cancellation/expiry calls won't restock twice.
	const claimed = await Order.findOneAndUpdate(
		{ _id: order._id, stockReserved: true },
		{ $set: { stockReserved: false } },
		{ new: true },
	);

	if (!claimed) return;

	for (const item of order.orderItems) {
		await Product.updateOne(
			{ _id: item.productId },
			{ $inc: { stock: item.quantity } },
		);
	}
};

export default releaseStock;

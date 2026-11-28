import Order from "../../models/orders.js";
import Product from "../../models/products.js";

// Call periodically from a scheduler to release abandoned Paystack reservations.
const releaseExpiredOrderReservations = async () => {
	const expiredOrders = await Order.find({
		paymentMethod: "paystack",
		paymentStatus: "pending",
		stockReserved: true,
		reservationExpiresAt: { $lte: new Date() },
	});

	for (const order of expiredOrders) {
		const claimed = await Order.findOneAndUpdate(
			{ _id: order._id, stockReserved: true },
			{
				$set: {
					stockReserved: false,
					paymentStatus: "failed",
				},
			},
		);

		if (!claimed) continue;

		for (const item of order.orderItems) {
			await Product.updateOne(
				{ _id: item.productId },
				{ $inc: { stock: item.quantity } },
			);
		}
	}
};

export default releaseExpiredOrderReservations;

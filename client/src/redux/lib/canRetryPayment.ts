import { Order } from "@/constants/types";

export const canRetryPayment = (order: Order) => {
	return (
		order.orderStatus === "placed" &&
		order.paymentMethod === "paystack" &&
		["pending", "failed"].includes(order.paymentStatus) &&
		order.stockReserved &&
		!!order.reservationExpiresAt &&
		new Date(order.reservationExpiresAt).getTime() > Date.now()
	);
};

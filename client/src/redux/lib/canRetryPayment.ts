import { Order } from "@/constants/types";

export const canRetryPayment = (order: Order): boolean => {
	const reservationIsValid =
		order.stockReserved &&
		order.reservationExpiresAt != null &&
		new Date(order.reservationExpiresAt).getTime() > Date.now();

	const reservation =
		order.reservationExpiresAt != null &&
		new Date(order.reservationExpiresAt).getTime();

	const orderIsPayable =
		order.orderStatus === "placed" &&
		order.paymentMethod === "paystack" &&
		order.paymentStatus !== "paid" &&
		order.paymentStatus !== "refunded" &&
		reservationIsValid;
	console.log(orderIsPayable, order.orderNumber);
	if (!orderIsPayable) return false;

	const attempts = order.paymentAttempts ?? [];
	const latestAttempt = attempts.at(-1);

	// No attempt yet: allow the first checkout.
	if (!latestAttempt) return true;

	// Allow another checkout only after the last attempt ended unsuccessfully.
	return (
		latestAttempt.status === "failed" ||
		latestAttempt.status === "abandoned" ||
		latestAttempt.status === "pending"
	);
};

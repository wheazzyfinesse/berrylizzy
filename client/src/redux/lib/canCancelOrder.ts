import { Order } from "@/constants/types";

export const canCancelOrder = (order: Order) => {
	const cancellableOrderStatus = ["placed", "processing"].includes(
		order.orderStatus,
	);

	const unpaidOrFailed =
		order.paymentStatus === "pending" || order.paymentStatus === "failed";

	const eligibleForPaystackRefund =
		order.paymentStatus === "paid" &&
		order.paymentMethod === "paystack" &&
		(!order.refundStatus || order.refundStatus === "not_requested");

	return (
		cancellableOrderStatus && (unpaidOrFailed || eligibleForPaystackRefund)
	);
};

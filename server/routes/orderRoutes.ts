import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import {
	createPendingOrder,
	deleteOrder,
	getMyOrders,
	getOrder,
	getOrders,
	updateOrder,
} from "../controllers/orderControllers.js";
import {
	cancelMyOrderWithRefund,
	verifyPaystackPaymentCallback,
} from "../utils/paystack.js";
import { retryOrderPayment } from "../utils/retryOrderPayment.js";

const OrderRouter = express.Router();

// Static paths first, before "/:id"
OrderRouter.get(
	"/payments/verify/paystack/callback",
	verifyPaystackPaymentCallback,
);
OrderRouter.get("/mine", protect, getMyOrders);

// Admin: read all orders
OrderRouter.get("/", protect, authorize("admin"), getOrders);

// Signed-in user: create an order
OrderRouter.post("/", protect, createPendingOrder);

// Signed-in user: read an order
// getOrder must check that the user owns it, unless the user is an admin.
OrderRouter.get("/:id", protect, getOrder);

// Signed-in user: cancel an order
// OrderRouter.post("/mine/:id/cancel", protect, cancelMyOrder);

// Signed-in user: cancel an order with refund
OrderRouter.post("/mine/:id/cancel", protect, cancelMyOrderWithRefund);

// Signed-in user: retry payment for a failed or pending order payment status
OrderRouter.post("/mine/:id/retry-payment", protect, retryOrderPayment);

// Admin: update order details or fulfillment status
OrderRouter.patch("/:id", protect, authorize("admin"), updateOrder);

// Admin: delete an order
OrderRouter.delete("/:id", protect, authorize("admin"), deleteOrder);

export default OrderRouter;

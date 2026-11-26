import express from "express";
// import {
// 	createPendingOrder,
// 	deleteOrder,
// 	getMyOrders,
// 	getOrder,
// 	getOrders,
// 	paystackCallback,
// 	updateOrder,
// 	verifyPaystackOrder,
// } from "../controllers/orderControllers.js";
import { authorize, protect } from "../middleware/auth.js";
import {
	createPendingOrder,
	deleteOrder,
	getMyOrders,
	getOrder,
	getOrders,
	updateOrder,
} from "../controllers/orderControllers.js";
import { paystackCallback } from "../utils/paystack.js";

const OrderRouter = express.Router();

// Static paths first, before "/:id"
OrderRouter.get("/payments/paystack/callback", paystackCallback);
OrderRouter.get("/mine", protect, getMyOrders);

// Admin: read all orders
OrderRouter.get("/", protect, authorize("admin"), getOrders);

// Signed-in user: create an order
OrderRouter.post("/", protect, createPendingOrder);

// Signed-in user: read one order
// getOrder must check that the user owns it, unless the user is an admin.
OrderRouter.get("/:id", protect, getOrder);

// Admin: update order details or fulfillment status
OrderRouter.put("/:id", protect, authorize("admin"), updateOrder);

// Admin: delete an order
OrderRouter.delete("/:id", protect, authorize("admin"), deleteOrder);

export default OrderRouter;

import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import verifyOrderPayment from "../controllers/orderControllers/verifyOrderPayment.js";
import { getMyOrders } from "../controllers/orderControllers/getMyOrders.js";
import getOrders from "../controllers/orderControllers/getOrders.js";
import createOrder from "../controllers/orderControllers/createOrder.js";
import getOrder from "../controllers/orderControllers/getOrder.js";
import cancelRefundOrder from "../controllers/orderControllers/cancelRefundOrder.js";
import { retryOrderPayment } from "../controllers/orderControllers/retryOrderPayment.js";
import updateOrder from "../controllers/orderControllers/updateOrder.js";
import deleteOrder from "../controllers/orderControllers/deleteOrder.js";
import { paystackCancel } from "../utils/paystack/paystackCancel.js";

const OrderRouter = express.Router();

// Static paths first, before "/:id"
// Verify an order payment
OrderRouter.get("/payments/paystack/verify/callback", verifyOrderPayment);
// Cancel an order payment intent
OrderRouter.get("/payments/paystack/cancel", paystackCancel);
// Get all orders by a user
OrderRouter.get("/mine", protect, getMyOrders);
// Get all orders by an admin
OrderRouter.get("/", protect, authorize("admin"), getOrders);
// Create an order
OrderRouter.post("/", protect, createOrder);
// Get an order
// getOrder must check that the user owns it, unless the user is an admin.
OrderRouter.get("/:id", protect, getOrder);
// Cancel an order and issue a refund when applicable only by the user
OrderRouter.post("/mine/:id/cancel", protect, cancelRefundOrder);
// Retry payment for a failed or pending order payment status
OrderRouter.post("/mine/:id/retry-payment", protect, retryOrderPayment);
// Update order details or fulfillment status
OrderRouter.patch("/:id", protect, authorize("admin"), updateOrder);
// Delete an order only an Admin
OrderRouter.delete("/:id", protect, authorize("admin"), deleteOrder);

export default OrderRouter;

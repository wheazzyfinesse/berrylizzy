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
OrderRouter.get("/payments/paystack/verify/callback", verifyOrderPayment);
OrderRouter.get("/payments/paystack/cancel", paystackCancel);
OrderRouter.get("/mine", protect, getMyOrders);

// Admin: read all orders
OrderRouter.get("/", protect, authorize("admin"), getOrders);

// Signed-in user: create an order
OrderRouter.post("/", protect, createOrder);

// Signed-in user: read an order
// getOrder must check that the user owns it, unless the user is an admin.
OrderRouter.get("/:id", protect, getOrder);

// Signed-in user: cancel an order
// OrderRouter.post("/mine/:id/cancel", protect, cancelMyOrder);

// Signed-in user: cancel an order with refund
OrderRouter.post("/mine/:id/cancel", protect, cancelRefundOrder);

// Signed-in user: retry payment for a failed or pending order payment status
OrderRouter.post("/mine/:id/retry-payment", protect, retryOrderPayment);

// Admin: update order details or fulfillment status
OrderRouter.patch("/:id", protect, authorize("admin"), updateOrder);

// Admin: delete an order
OrderRouter.delete("/:id", protect, authorize("admin"), deleteOrder);

export default OrderRouter;

import mongoose, { Types } from "mongoose";
import Order from "../models/orders.js";
import Product from "../models/products.js";
import { initializePaystackPaymentCheckout } from "../utils/paystack.js";
const RESERVATION_MINUTES = 30;
const SHIPPING_THRESHOLD = 10_000;
const SHIPPING_COST = 1_000;
const TAX_RATE = 0.2; // Replace with your actual tax rate.
// POST /api/orders
export async function createPendingOrder(req, res) {
    const reserved = [];
    let order;
    const orderItems = [];
    try {
        await releaseExpiredOrderReservations();
        // Validate, sanitize, authenticate and protect
        if (!req.user)
            return res.status(401).json("Unauthorized");
        const { pendingOrderItems, shippingAddress, notes, paymentMethod } = req.body;
        if (!Array.isArray(pendingOrderItems) || pendingOrderItems.length === 0) {
            return res.status(400).json("Cart is empty");
        }
        if (!shippingAddress) {
            return res.status(400).json("Shipping address is required");
        }
        if (!["cash", "paystack"].includes(paymentMethod)) {
            return res.status(400).json("Invalid payment method");
        }
        // Start mongoose session with transaction
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                for (const item of pendingOrderItems) {
                    if (!Types.ObjectId.isValid(item.productId) ||
                        !Number.isInteger(item.quantity) ||
                        item.quantity < 1 ||
                        typeof item.size !== "string") {
                        throw Object.assign(new Error("Invalid order item"), {
                            statusCode: 400,
                        });
                    }
                    const product = await Product.findById(item.productId);
                    if (!product) {
                        throw Object.assign(new Error("Product not found"), {
                            statusCode: 404,
                        });
                    }
                    // Reserve product stock here, using { session }.
                    // Atomic reservation prevents concurrent checkouts overselling this item.
                    const orderReservation = await Product.updateOne({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
                    if (orderReservation.modifiedCount !== 1) {
                        throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { statusCode: 409 });
                    }
                    reserved.push({ productId: item.productId, quantity: item.quantity });
                    orderItems.push({
                        product: product._id,
                        name: product.name,
                        size: item.size,
                        price: product.price,
                        quantity: item.quantity,
                    });
                }
                const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const shippingCost = subtotal > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
                const tax = Math.round(subtotal * TAX_RATE);
                if (!req.user) {
                    return res.status(401).json("Unauthorized");
                }
                // orderItems must already contain product IDs, DB prices, and validated quantities.
                // Before creating order
                const orderDoc = new Order({
                    user: req.user._id,
                    orderItems,
                    shippingAddress,
                    notes,
                    paymentMethod,
                    paymentStatus: "pending",
                    orderStatus: "placed",
                    shippingCost,
                    orderNumber: `ORD-${Date.now()}`,
                    tax,
                    stockReserved: true,
                    reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
                });
                const createdOrder = await orderDoc.save({ session });
                if (!createdOrder) {
                    throw new Error("Order was not created");
                }
                order = createdOrder;
            });
        }
        finally {
            await session.endSession();
        }
        if (!order) {
            throw new Error("Order was not created");
        }
        // Initialize Paystack only after the transaction commits.
        // If initialization fails, release the reservation in a separate transaction.
        if (paymentMethod === "paystack") {
            try {
                const paystackCheckout = await initializePaystackPaymentCheckout({
                    amountInNaira: order.totalAmount,
                    email: req.user.email,
                    orderId: String(order._id),
                });
                order.paymentAttempts.push({
                    reference: paystackCheckout.reference,
                    status: "pending",
                    createdAt: new Date(),
                });
                await order.save();
                return res.status(201).json({
                    order,
                    authorization_url: paystackCheckout.authorization_url,
                    reference: paystackCheckout.reference,
                });
            }
            catch (error) {
                order.paymentStatus = "failed";
                await order.save();
                await releaseStock(order);
                throw error;
            }
        }
        // If payment is by cash, order is accepted;
        // Its reserved stock remains deducted as placed order rather than merely a reserved order.
        order.stockReserved = false;
        order.reservationExpiresAt = null;
        await order.save();
        return res.status(201).json({
            order,
            authorization_url: "",
            reference: "",
        });
    }
    catch (error) {
        // If order creation failed before the reservation was attached to an order,
        // restore every stock quantity reserved so far.
        for (const item of reserved) {
            await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
        }
        const statusCode = typeof error === "object" &&
            error !== null &&
            "statusCode" in error &&
            typeof error.statusCode === "number"
            ? error.statusCode
            : 500;
        console.error(error);
        return res
            .status(statusCode)
            .json(statusCode === 500
            ? "Could not create order"
            : error.message);
    }
}
// GET /api/orders — admin only
export async function getOrders(_req, res) {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("orderItems.product", "name images")
            .sort({ createdAt: -1 });
        return res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not get orders");
    }
}
// GET /api/orders/mine
export async function getMyOrders(req, res) {
    try {
        if (!req.user)
            return res.status(401).json("Unauthorized");
        const orders = await Order.find({ user: req.user._id })
            .sort({
            createdAt: -1,
        })
            .populate("orderItems.product", "name images");
        return res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not get your orders");
    }
}
// GET /api/orders/:id — owner or admin
export async function getOrder(req, res) {
    const orderId = req.params.id;
    try {
        if (!req.user)
            return res.status(401).json("Unauthorized");
        if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
            return res.status(400).json("Invalid order ID");
        }
        const order = await Order.findById(req.params.id).populate("user", "name email");
        if (!order)
            return res.status(404).json("Order not found");
        const ownerId = String(order.user?._id ?? order.user);
        if (ownerId !== String(req.user._id) && req.user.role !== "admin") {
            return res.status(403).json("You cannot access this order");
        }
        return res.status(200).json(order);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not get order");
    }
}
// PUT /api/orders/:id — admin may update fulfillment fields, never payment fields
export async function updateOrder(req, res) {
    const orderId = req.params.id;
    console.log(orderId);
    try {
        if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
            return res.status(400).json("Invalid order ID");
        }
        const allowedStatuses = [
            "placed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];
        const orderStatus = req.body.orderStatus;
        if (orderStatus !== undefined && !allowedStatuses.includes(orderStatus)) {
            return res.status(400).json("Invalid order status");
        }
        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json("Order not found");
        if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
            return res
                .status(409)
                .json("A paid order cannot be cancelled except by the customer");
        }
        if (order.paymentStatus !== "paid" &&
            orderStatus !== undefined &&
            orderStatus !== "cancelled") {
            return res.status(409).json("An unpaid order can only be cancelled");
        }
        if (orderStatus !== undefined)
            order.orderStatus = orderStatus;
        if (orderStatus === "delivered") {
            order.deliveredAt = new Date();
            order.stockReserved = false;
            order.reservationExpiresAt = null;
        }
        await order.save();
        if (orderStatus === "cancelled") {
            await releaseStock(order);
        }
        return res.status(200).json(order);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not update order");
    }
}
// DELETE /api/orders/:id — admin; paid orders are retained
export async function deleteOrder(req, res) {
    const orderId = req.params.id;
    try {
        if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
            return res.status(400).json("Invalid order ID");
        }
        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        if (order.paymentStatus === "paid") {
            return res.status(409).json("Paid orders cannot be deleted");
        }
        await releaseStock(order);
        await order.deleteOne();
        return res.status(200).json("Order deleted");
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not delete order");
    }
}
// Release reserved stock for a cancelled or expired order.
export async function releaseStock(order) {
    // Flip the flag first, so repeated cancellation/expiry calls won't restock twice.
    const claimed = await Order.findOneAndUpdate({ _id: order._id, stockReserved: true }, { $set: { stockReserved: false } }, { new: true });
    if (!claimed)
        return;
    for (const item of order.orderItems) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }
}
// Call periodically from a scheduler to release abandoned Paystack reservations.
export async function releaseExpiredOrderReservations() {
    const expiredOrders = await Order.find({
        paymentMethod: "paystack",
        paymentStatus: "pending",
        stockReserved: true,
        reservationExpiresAt: { $lte: new Date() },
    });
    for (const order of expiredOrders) {
        const claimed = await Order.findOneAndUpdate({ _id: order._id, stockReserved: true }, {
            $set: {
                stockReserved: false,
                paymentStatus: "failed",
            },
        });
        if (!claimed)
            continue;
        for (const item of order.orderItems) {
            await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        }
    }
}
// POST /api/orders/:id/cancel
export const cancelMyOrder = async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId);
    if (!req.user) {
        return res.status(401).json("Unauthorized");
    }
    if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
        return res.status(400).json("Invalid order ID");
    }
    try {
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });
        if (!order) {
            return res.status(404).json("Order not found");
        }
        if (order.orderStatus === "cancelled") {
            return res.status(200).json("Order Already cancelled"); // Already cancelled
        }
        if (["shipped", "delivered"].includes(order.orderStatus)) {
            return res.status(409).json("This order can no longer be cancelled");
        }
        if (order.paymentStatus === "paid") {
            return res.status(409).json("Contact support to cancel a paid order");
        }
        order.orderStatus = "cancelled";
        await order.save();
        // Release reserved stock only if this order still holds a reservation.
        await releaseStock(order);
        return res.status(200).json(order);
    }
    catch (error) {
        console.error("Customer order cancellation failed:", error);
        return res.status(500).json({ message: "Could not cancel order" });
    }
};
//# sourceMappingURL=orderControllers.js.map
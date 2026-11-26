import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Order from "../models/orders.js";
import Product from "../models/products.js";
import { initializePaystackCheckout } from "../utils/paystack.js";
import type { IOrderItem } from "../types/index.js";

type OrderItemInput = {
	productId: string;
	quantity: number;
	size: string;
};

const RESERVATION_MINUTES = 30;
const SHIPPING_THRESHOLD = 10_000;
const SHIPPING_COST = 1_000;
const TAX_RATE = 0.2; // Replace with your actual tax rate.

async function releaseStock(order: any) {
	// Flip the flag first, so repeated cancellation/expiry calls won't restock twice.
	const claimed = await Order.findOneAndUpdate(
		{ _id: order._id, stockReserved: true },
		{ $set: { stockReserved: false } },
		{ new: true },
	);

	if (!claimed) return;

	for (const item of order.orderItems) {
		await Product.updateOne(
			{ _id: item.product },
			{ $inc: { stock: item.quantity } },
		);
	}
}

// GET /api/orders — admin only
export async function getOrders(_req: Request, res: Response) {
	try {
		const orders = await Order.find()
			.populate("user", "name email")
			.sort({ createdAt: -1 });

		return res.status(200).json(orders);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get orders");
	}
}

// GET /api/orders/mine
export async function getMyOrders(req: Request, res: Response) {
	try {
		if (!req.user) return res.status(401).json("Unauthorized");

		const orders = await Order.find({ user: req.user._id }).sort({
			createdAt: -1,
		});

		return res.status(200).json(orders);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get your orders");
	}
}

// GET /api/orders/:id — owner or admin
export async function getOrder(req: Request, res: Response) {
	const orderId = req.params.id;
	try {
		if (!req.user) return res.status(401).json("Unauthorized");

		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json("Invalid order ID");
		}

		const order = await Order.findById(req.params.id).populate(
			"user",
			"name email",
		);

		if (!order) return res.status(404).json("Order not found");

		const ownerId = String((order.user as any)?._id ?? order.user);

		if (ownerId !== String(req.user._id) && req.user.role !== "admin") {
			return res.status(403).json("You cannot access this order");
		}

		return res.status(200).json(order);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get order");
	}
}

// POST /api/orders
export async function createPendingOrder(req: Request, res: Response) {
	const reserved: Array<{ productId: Types.ObjectId; quantity: number }> = [];
	let order: InstanceType<typeof Order> | undefined;
	const orderItems: IOrderItem[] = [];

	try {
		await releaseExpiredOrderReservations();

		// Validate, sanitize, authenticate and protect
		if (!req.user) return res.status(401).json("Unauthorized");

		const { pendingOrderItems, shippingAddress, notes, paymentMethod } =
			req.body;
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
					if (
						!Types.ObjectId.isValid(item.productId) ||
						!Number.isInteger(item.quantity) ||
						item.quantity < 1 ||
						typeof item.size !== "string"
					) {
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
					const orderReservation = await Product.updateOne(
						{ _id: item.productId, stock: { $gte: item.quantity } },
						{ $inc: { stock: -item.quantity } },
					);

					if (orderReservation.modifiedCount !== 1) {
						throw Object.assign(
							new Error(`Insufficient stock for ${product.name}`),
							{ statusCode: 409 },
						);
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

				const subtotal = orderItems.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0,
				);
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
		} finally {
			await session.endSession();
		}

		if (!order) {
			throw new Error("Order was not created");
		}
		// Initialize Paystack only after the transaction commits.
		// If initialization fails, release the reservation in a separate transaction.
		if (paymentMethod === "paystack") {
			try {
				const paystackCheckout = await initializePaystackCheckout({
					amountInNaira: order.totalAmount,
					email: req.user.email,
					orderId: String(order._id),
				});
				order.paymentReference = paystackCheckout.reference;
				await order.save();

				return res.status(201).json({
					order,
					authorization_url: paystackCheckout.authorization_url,
					reference: paystackCheckout.reference,
				});
			} catch (error) {
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
	} catch (error) {
		// If order creation failed before the reservation was attached to an order,
		// restore every stock quantity reserved so far.
		for (const item of reserved) {
			await Product.updateOne(
				{ _id: item.productId },
				{ $inc: { stock: item.quantity } },
			);
		}

		const statusCode =
			typeof error === "object" &&
			error !== null &&
			"statusCode" in error &&
			typeof error.statusCode === "number"
				? error.statusCode
				: 500;

		console.error(error);
		return res
			.status(statusCode)
			.json(
				statusCode === 500
					? "Could not create order"
					: (error as Error).message,
			);
	}
}

// PUT /api/orders/:id — admin may update fulfillment fields, never payment fields
export async function updateOrder(req: Request, res: Response) {
	const orderId = req.params.id;

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

		const { orderStatus, notes } = req.body;

		if (orderStatus !== undefined && !allowedStatuses.includes(orderStatus)) {
			return res.status(400).json("Invalid order status");
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json("Order not found");

		if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
			return res
				.status(409)
				.json("A paid order cannot be cancelled through this endpoint");
		}

		if (orderStatus !== undefined) order.orderStatus = orderStatus;
		if (notes !== undefined) order.notes = notes;

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
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not update order");
	}
}

// DELETE /api/orders/:id — admin; paid orders are retained
export async function deleteOrder(req: Request, res: Response) {
	const orderId = req.params.id;

	try {
		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json("Invalid order ID");
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		if (order.paymentStatus === "paid") {
			return res.status(409).json("Paid orders cannot be deleted");
		}

		await releaseStock(order);
		await order.deleteOne();

		return res.status(200).json("Order deleted");
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not delete order");
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
				{ _id: item.product },
				{ $inc: { stock: item.quantity } },
			);
		}
	}
}

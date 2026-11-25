import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Order from "../models/orders.js";
import Product from "../models/products.js";
import { initializePaystackCheckout } from "../utils/paystack.js";
import type { IAddress, IOrder, IOrderItem } from "../types/index.js";

type AuthRequest = Request & {
	user?: {
		_id: Types.ObjectId;
		role: string;
		email: string;
	};
};

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

		return res.status(200).json({ success: true, data: orders });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Could not get orders" });
	}
}

// GET /api/orders/mine
export async function getMyOrders(req: Request, res: Response) {
	try {
		if (!req.user) return res.status(401).json({ message: "Unauthorized" });

		const orders = await Order.find({ user: req.user._id }).sort({
			createdAt: -1,
		});

		return res.status(200).json({ success: true, data: orders });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Could not get your orders" });
	}
}

// GET /api/orders/:id — owner or admin
export async function getOrder(req: Request, res: Response) {
	const orderId = req.params.id;
	try {
		if (!req.user) return res.status(401).json({ message: "Unauthorized" });

		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json({ message: "Invalid order ID" });
		}

		const order = await Order.findById(req.params.id).populate(
			"user",
			"name email",
		);

		if (!order) return res.status(404).json({ message: "Order not found" });

		const ownerId = String((order.user as any)?._id ?? order.user);

		if (ownerId !== String(req.user._id) && req.user.role !== "admin") {
			return res.status(403).json({ message: "You cannot access this order" });
		}

		return res.status(200).json({ success: true, data: order });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Could not get order" });
	}
}

// POST /api/orders
export async function createPendingOrder(req: Request, res: Response) {
	const reserved: Array<{ productId: Types.ObjectId; quantity: number }> = [];
	await releaseExpiredOrderReservations();
	try {
		if (!req.user) return res.status(401).json({ message: "Unauthorized" });

		const {
			pendingOrderItems,
			shippingAddress,
			notes,
			paymentMethod,
		}: {
			pendingOrderItems: OrderItemInput[];
			shippingAddress?: IAddress;
			notes?: string;
			paymentMethod: "cash" | "paystack";
		} = req.body;

		if (!Array.isArray(pendingOrderItems) || pendingOrderItems.length === 0) {
			return res.status(400).json({ message: "Cart is empty" });
		}

		if (!shippingAddress) {
			return res.status(400).json({ message: "Shipping address is required" });
		}

		if (!["cash", "paystack"].includes(paymentMethod)) {
			return res.status(400).json({ message: "Invalid payment method" });
		}

		const orderItems: IOrderItem[] = [];

		for (const item of pendingOrderItems) {
			if (
				!Types.ObjectId.isValid(item.productId) ||
				!Number.isInteger(item.quantity) ||
				item.quantity < 1 ||
				typeof item.size !== "string"
			) {
				throw Object.assign(new Error("Invalid cart item"), {
					statusCode: 400,
				});
			}

			const productId = new Types.ObjectId(item.productId);
			const product = await Product.findById(productId);

			if (!product) {
				throw Object.assign(new Error("Product not found"), {
					statusCode: 404,
				});
			}

			// Atomic reservation prevents concurrent checkouts overselling this item.
			const orderReservation = await Product.updateOne(
				{ _id: productId, stock: { $gte: item.quantity } },
				{ $inc: { stock: -item.quantity } },
			);

			if (orderReservation.modifiedCount !== 1) {
				throw Object.assign(
					new Error(`Insufficient stock for ${product.name}`),
					{ statusCode: 409 },
				);
			}

			reserved.push({ productId, quantity: item.quantity });

			orderItems.push({
				product: productId,
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

		// orderItems must already contain product IDs, DB prices, and validated quantities.
		const session = await mongoose.startSession();
		let order: InstanceType<typeof Order> | undefined;

		try {
			await session.withTransaction(async () => {
				for (const item of pendingOrderItems) {
					const reserved = await Product.updateOne(
						{
							_id: item.productId,
							stock: { $gte: item.quantity },
						},
						{ $inc: { stock: -item.quantity } },
						{ session },
					);

					if (reserved.modifiedCount !== 1) {
						throw Object.assign(new Error("Insufficient stock"), {
							statusCode: 409,
						});
					}
				}

				let createdOrder: InstanceType<typeof Order> | undefined;

				await session.withTransaction(async () => {
					if (!req.user)
						return res.status(401).json({ message: "Unauthorized" });

					// Reserve product stock here, using { session }.

					const orderDoc = new Order({
						user: req.user._id,
						orderItems,
						shippingAddress,
						notes,
						paymentMethod,
						paymentStatus: "pending",
						orderStatus: "placed",
						subtotal,
						shippingCost,
						tax,
						totalAmount: subtotal + shippingCost + tax,
						stockReserved: true,
						reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
					});

					await orderDoc.save({ session });
					createdOrder = orderDoc;
				});

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
				const checkout = await initializePaystackCheckout({
					amountInNaira: order.totalAmount,
					email: req.user.email,
					orderId: String(order._id),
				});

				order.paymentReference = checkout.reference;
				await order.save();

				return res.status(201).json({
					success: true,
					data: {
						order,
						authorizationUrl: checkout.authorization_url,
						reference: checkout.reference,
					},
				});
			} catch (error) {
				order.paymentStatus = "failed";
				await order.save();
				await releaseStock(order);
				throw error;
			}
		}

		// Cash order is accepted; its reserved stock remains deducted.
		order.stockReserved = false;
		order.reservationExpiresAt = null;
		await order.save();

		return res.status(201).json({ success: true, data: order });
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
		return res.status(statusCode).json({
			success: false,
			message:
				statusCode === 500
					? "Could not create order"
					: (error as Error).message,
		});
	}
}

// Verify payment
// POST /api/orders/paystack/verify
export async function verifyPaystackOrder(req: Request, res: Response) {
	try {
		const { reference } = req.body;
		if (typeof reference !== "string" || !reference) {
			return res.status(400).json({ message: "Payment reference is required" });
		}
		if (!req.user) {
			return res.status(400).json({ message: "Not authorized" });
		}

		const order = await Order.findOne({
			user: req.user._id,
			paymentReference: reference,
			paymentMethod: "paystack",
		});

		if (!order) return res.status(404).json({ message: "Order not found" });

		if (order.paymentStatus === "paid") {
			return res.status(200).json({ success: true, data: order });
		}

		const secret = process.env.PAYSTACK_SECRET_KEY;
		if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

		const response = await fetch(
			`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
			{ headers: { Authorization: `Bearer ${secret}` } },
		);
		const result: any = await response.json();
		const transaction = result.data;

		if (
			!response.ok ||
			!result.status ||
			transaction?.status !== "success" ||
			transaction.reference !== order.paymentReference ||
			transaction.amount !== Math.round(order.totalAmount * 100) ||
			transaction.currency !== "NGN" ||
			transaction.metadata?.orderId !== String(order._id)
		) {
			return res.status(402).json({
				success: false,
				message: "Payment is not confirmed",
			});
		}

		order.paymentStatus = "paid";
		order.stockReserved = false;
		order.reservationExpiresAt = null;
		await order.save();

		return res.status(200).json({ success: true, data: order });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Could not verify payment",
		});
	}
}

// PUT /api/orders/:id — admin may update fulfillment fields, never payment fields
export async function updateOrder(req: Request, res: Response) {
	const orderId = req.params.id;

	try {
		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json({ message: "Invalid order ID" });
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
			return res.status(400).json({ message: "Invalid order status" });
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
			return res.status(409).json({
				message: "A paid order cannot be cancelled through this endpoint",
			});
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

		return res.status(200).json({ success: true, data: order });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Could not update order" });
	}
}

// DELETE /api/orders/:id — admin; paid orders are retained
export async function deleteOrder(req: Request, res: Response) {
	const orderId = req.params.id;

	try {
		if (typeof orderId !== "string" || !Types.ObjectId.isValid(orderId)) {
			return res.status(400).json({ message: "Invalid order ID" });
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		if (order.paymentStatus === "paid") {
			return res.status(409).json({ message: "Paid orders cannot be deleted" });
		}

		await releaseStock(order);
		await order.deleteOne();

		return res.status(200).json({
			success: true,
			message: "Order deleted",
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Could not delete order" });
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

// Paystack callback
export function paystackCallback(req: Request, res: Response) {
	const reference =
		typeof req.query.reference === "string"
			? req.query.reference
			: typeof req.query.trxref === "string"
				? req.query.trxref
				: null;

	const appReturnUrl = process.env.PAYMENT_RETURN_URL;

	if (!reference || !appReturnUrl) {
		return res.status(400).send("Invalid payment callback");
	}

	const destination = new URL(appReturnUrl);
	destination.searchParams.set("reference", reference);

	return res.redirect(303, destination.toString());
}

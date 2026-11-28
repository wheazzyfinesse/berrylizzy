import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import type { IOrderItem } from "../../types/index.js";
import Order from "../../models/orders.js";
import releaseExpiredOrderReservations from "./releaseExpiredOrderReservations.js";
import Product from "../../models/products.js";
import releaseStock from "./releaseStock.js";
import initializePaystackPayment from "../../utils/paystack/initializePaystackPayment.js";
import { randomUUID } from "node:crypto";

const RESERVATION_MINUTES = 30;
const SHIPPING_THRESHOLD = 10_000;
const SHIPPING_COST = 1_000;
const TAX_RATE = 0.2; // Replace with your actual tax rate.

// POST /api/orders
const createOrder = async (req: Request, res: Response) => {
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
						productId: product._id,
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
			const requestedReference = `pay-${order._id}-${randomUUID().replaceAll("-", "")}`;

			try {
				const { result } = await initializePaystackPayment({
					amountInNaira: order.totalAmount,
					email: req.user.email,
					orderId: String(order._id),
					reference: requestedReference,
				});

				order.paymentAttempts.push({
					requestedReference,
					reference: result?.data.reference,
					status: "pending",
					authorizationUrl: result?.data.authorization_url,
					createdAt: new Date(),
				});

				await order.save();

				return res.status(201).json({
					order,
					authorization_url: result?.data.authorization_url,
					reference: result?.data.reference,
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
};

export default createOrder;

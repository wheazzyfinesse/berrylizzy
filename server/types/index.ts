import { Document, Types } from "mongoose";

export interface IAddress {
	user: Types.ObjectId;
	type: "Home" | "Work" | "Other";
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone: string;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const validTypes = ["Home", "Work", "Other"] as const;

type PaymentAttemptStatus =
	| "abandoned"
	| "pending"
	| "failed"
	| "paid"
	| "initializing";

export interface IPaymentAttempt {
	requestedReference: string;
	reference: string;
	status: PaymentAttemptStatus;
	createdAt: Date;
}

export interface IOrderItem {
	productId: Types.ObjectId;
	quantity: number;
	price: number;
	size?: string;
}
export type IOrderStatus =
	| "placed"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled";

export type IRefundStatus =
	| "not_requested"
	| "pending"
	| "processing"
	| "needs-attention"
	| "processed"
	| "failed"
	| "initiating";

export interface IOrder extends Document {
	user: Types.ObjectId;
	orderItems: IOrderItem[];
	shippingAddress: IAddress;
	paymentMethod: "cash" | "stripe";
	paymentStatus: "pending" | "paid" | "unverified" | "failed" | "refunded";
	refundStatus: IRefundStatus;
	paymentAttempts: IPaymentAttempt[];
	orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
	subtotal: number;
	shippingCost: number;
	tax: number;
	stockReserved: boolean;
	reservationExpiresAt: Date | null;
	totalAmount: number;
	notes?: string;
	deliveredAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface IProduct extends Document {
	name: string;
	description: string;
	price: number;
	comparePrice?: number;
	images: string[];
	sizes: "S" | "M" | "L" | "XL" | "XXL";
	category: "Men" | "Women" | "Kids" | "Shoes" | "Bags" | "Other";
	stock: number;
	ratings: {
		average: number;
		count: number;
	};
	isFeatured: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IUser extends Document {
	name: string;
	email: string;
	clerkId: string;
	image?: string;
	role: "user" | "admin";
	createdAt: Date;
	updatedAt: Date;
}

export interface IWishlist extends Document {
	user: Types.ObjectId;
	products: Types.ObjectId[];
	createdAt: Date;
}
export interface CreateOrder {
	pendingOrderItems: IOrderItem[];
	shippingAddress: IAddress;
	paymentMethod: "cash" | "stripe";
	notes?: string;
}

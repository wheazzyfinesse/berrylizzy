import mongoose, { Schema } from "mongoose";

const PaymentAttemptSchema = new Schema(
	{
		requestedReference: { type: String, required: true },
		reference: { type: String, required: true },
		authorizationUrl: { type: String, default: "" },
		status: {
			type: String,
			enum: ["abandoned", "pending", "failed", "paid", "initializing"],
			default: "pending",
			required: true,
		},
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: false },
);

const OrderItemSchema = new Schema({
	productId: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	size: { type: String, required: true },
	price: {
		type: Number,
		required: true,
		min: 0,
	},
});

export const ShippingAddressSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	firstName: {
		type: String,
		default: "",
		required: true,
	},
	lastName: {
		type: String,
		default: "",
		required: true,
	},
	street: {
		default: "",
		type: String,
		required: true,
	},
	city: {
		type: String,
		default: "",
		required: true,
	},
	state: {
		type: String,
		default: "",
		required: true,
	},
	zipCode: {
		type: String,
		default: "",
		required: true,
	},
	country: {
		type: String,
		default: "",
		required: true,
	},
	phone: {
		type: String,
		default: "",
		required: true,
	},
});

const OrderSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		orderNumber: {
			type: String,
			required: true,
		},
		orderItems: [OrderItemSchema],
		shippingAddress: ShippingAddressSchema,
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed", "refunded"],
			default: "pending",
		},
		paymentMethod: {
			type: String,
			enum: ["cash", "paystack"],
			default: "cash",
		},
		paymentAttempts: { type: [PaymentAttemptSchema], default: [] },
		refundReference: {
			type: String,
			unique: true,
			sparse: true,
			default: undefined,
		},
		refundStatus: {
			type: String,
			enum: [
				"not_requested",
				"pending",
				"processing",
				"needs-attention",
				"processed",
				"failed",
				"initiating",
			],
			default: "not_requested",
		},
		stockRestocked: {
			type: Boolean,
			default: false,
		},
		orderStatus: {
			type: String,
			enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
			default: "placed",
		},
		subtotal: {
			type: Number,
			required: true,
		},
		shippingCost: {
			type: Number,
			default: 0,
		},
		tax: {
			type: Number,
			default: 0,
		},
		stockReserved: { type: Boolean, default: false },
		reservationExpiresAt: { type: Date },
		totalAmount: {
			type: Number,
			required: true,
		},
		notes: String,
		deliveredAt: Date,
	},
	{
		timestamps: true,
	},
);

// OrderSchema.methods.calculateSubtotal = function (this: IOrder) {
// 	this.subtotal = this.orderItems.reduce<number>(
// 		(sum, orderItem: IOrderItem) => sum + orderItem.price * orderItem.quantity,
// 		0,
// 	);

// 	return this.subtotal;
// };
// OrderSchema.methods.calculateTotal = function (this: IOrder) {
// 	this.totalAmount =
// 		this.orderItems.reduce<number>(
// 			(sum, orderItem: IOrderItem) =>
// 				sum + orderItem.price * orderItem.quantity,
// 			0,
// 		) +
// 		this.shippingCost +
// 		this.tax;

// 	return this.totalAmount;
// };

// Calculate subtotal and total before saving
OrderSchema.pre("validate", function () {
	this.subtotal = this.orderItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	this.shippingCost ??= 0;
	this.tax ??= 0;
	this.totalAmount = this.subtotal + this.shippingCost + this.tax;
});
const Order = mongoose.model("Order", OrderSchema);

export default Order;

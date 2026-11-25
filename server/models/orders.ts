import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema({
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	name: { type: String, required: true },
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
	address: {
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
		paymentReference: {
			type: String,
			unique: true,
			sparse: true,
			default: null,
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

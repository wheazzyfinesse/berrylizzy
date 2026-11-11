import { Product } from ".";
import type {
	BaseEntity,
	ID,
	OrderStatus,
	PaymentMethod,
	PaymentStatus,
} from "./common";

export interface OrderShippingAddress {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface OrderItem {
	productId: Product | ID;
	name: string;
	price: number;
	quantity: number;
	size?: string;
	image?: string[];
}

export interface Order extends BaseEntity {
	user: ID;
	orderNumber: string;
	items: OrderItem[];
	shippingAddress: OrderShippingAddress;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	orderStatus: OrderStatus;
	subtotal: number;
	shippingCost: number;
	tax: number;
	totalAmount: number;
	notes?: string;
	paymentIntentId?: string;
	deliveredAt?: string;
}

export interface CreateOrderRequest {
	items: OrderItem[];
	shippingAddress: OrderShippingAddress;
	paymentMethod: PaymentMethod;
	subtotal: number;
	shippingCost: number;
	tax: number;
	totalAmount: number;
	notes?: string;
}

export interface UpdateOrderStatusInput {
	orderId: ID;
	orderStatus: OrderStatus;
}

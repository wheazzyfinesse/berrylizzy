import { Address, Product } from ".";
import type {
	BaseEntity,
	ID,
	OrderStatus,
	PaymentMethod,
	PaymentStatus,
} from "./common";

export interface OrderShippingAddress extends Address {
	firstName: string;
	lastName: string;
}

export interface paymentAttempt {
	reference: string;
	status: string;
	createdAt: string;
}
export interface OrderItem {
	product: ID;
	name: string;
	quantity: number;
	price: number;
	size?: string;
}

export interface Order extends BaseEntity {
	user: ID;
	orderNumber: string;
	orderItems: OrderItem[];
	shippingAddress: OrderShippingAddress;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	orderStatus: OrderStatus;
	subtotal: number;
	shippingCost: number;
	tax: number;
	totalAmount: number;
	notes?: string;
	stockReserved?: string;
	reservationExpiresAt?: string;
	paymentAttempts?: paymentAttempt[];
	refundReference?: string;
	refundStatus?: string;
	deliveredAt?: string;
}
export type CreatePendingOrderResponse = {
	order: Order;
	authorization_url: string;
	reference: string;
};

export interface CreateOrderRequest {
	pendingOrderItems: OrderItem[];
	shippingAddress: OrderShippingAddress;
	paymentMethod: PaymentMethod;
	notes?: string;
}

export interface UpdateOrderRequest {
	id: ID;
	data: {
		orderStatus?: OrderStatus;
	};
}

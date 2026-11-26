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

export interface OrderItem {
	productId: Product | ID;
	quantity: number;
	size?: string;
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
	paymentReference?: string;
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

export interface UpdateOrderStatusInput {
	orderId: ID;
	orderStatus: OrderStatus;
}

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
	success: boolean;
	data: {
		order: Order;
		authorizationUrl: string;
		reference: string;
	};
	message?: string;
};

export interface CreateOrderRequest {
	orderItems: OrderItem[];
	shippingAddress: OrderShippingAddress;
	paymentMethod: PaymentMethod;
	notes?: string;
}

export interface UpdateOrderStatusInput {
	orderId: ID;
	orderStatus: OrderStatus;
}

import { Address } from ".";
import type {
	BaseEntity,
	ID,
	OrderStatus,
	PaymentAttemptStatus,
	PaymentMethod,
	PaymentStatus,
	RefundStatus,
} from "./common";

export interface OrderShippingAddress extends Address {
	firstName: string;
	lastName: string;
}

export interface paymentAttempt {
	requestedReference: string;
	reference: string;
	status: PaymentAttemptStatus;
	createdAt: string;
}
export interface OrderItem {
	productId: ID;
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
	refundStatus?: RefundStatus;
	deliveredAt?: string;
}
export type CreateOrderResponse = {
	order: Order;
	authorization_url: string;
	reference: string;
	continueExistingAttempt?: boolean;
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

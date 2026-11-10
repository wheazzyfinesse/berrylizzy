import { BaseEntity, ID, PaymentStatus } from "./common";

export interface InitializePaymentRequest {
	orderId: ID;
	email: string;
}

export interface InitializePaymentResponse {
	authorizationUrl: string;
	accessCode: string;
	reference: string;
}

export interface VerifyPaymentRequest {
	reference: string;
}

export interface VerifyPaymentResponse {
	reference: string;
	status: PaymentStatus;
	amount: number;
	currency: string;
	paidAt?: string;
	channel?: string;
	orderId: ID;
}

export interface Payment extends BaseEntity {
	order: ID;
	user: ID;
	reference: string;
	amount: number;
	currency: string;
	status: PaymentStatus;
	channel?: string;
	paidAt?: string;
}

export const paymentMethod = [
	{
		id: "cash",
		title: "Cash on Delivery",
		description: "Pay when your order arrives.",
		icon: "cash-outline",
	},
	{
		id: "stripe",
		title: "Card Payment",
		description: "Pay securely using Stripe.",
		icon: "card-outline",
	},
];

import type { ID } from "./common";
import type { Address } from "./address";
import type { PaymentMethod } from "./common";

export type CheckoutStep = 1 | 2 | 3;

export const CHECKOUT_STEPS = [
	{ step: 1, label: "Address" },
	{ step: 2, label: "Payment" },
	{ step: 3, label: "Review" },
];

export interface CheckoutState {
	step: CheckoutStep;
	selectedAddressId: ID | null;
	paymentMethod: PaymentMethod;
	notes: string;
	isPlacingOrder: boolean;
}

export interface CheckoutSummary {
	subtotal: number;
	discount: number;
	shippingCost: number;
	tax: number;
	totalAmount: number;
}

export interface CheckoutFormData {
	address: Address | null;
	paymentMethod: PaymentMethod;
	notes: string;
}

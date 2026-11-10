import type { BaseEntity, ID } from "./common";
import type { Product } from "./product";

export interface CartItem {
	_id: ID;
	product: Product;
	quantity: number;
	price: number;
	size: string;
}

export interface Cart extends BaseEntity {
	user: ID;
	items: CartItem[];
	totalAmount: number;
}

export interface AddToCartInput {
	product: Product;
	quantity?: number;
	size: string;
}

export interface UpdateCartQuantityInput {
	productId: ID;
	size: string;
	quantity: number;
}

export interface RemoveCartItemInput {
	productId: ID;
	size: string;
}

export interface CartTotals {
	itemCount: number;
	subtotal: number;
	discount: number;
	shippingCost: number;
	total: number;
}

export interface CartState {
	items: CartItem[];
	promoCode: string | null;
	discount: number;
	isCartOpen: boolean;
}

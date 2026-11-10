import type { CartState, Product, CartItem } from "@/constants/types";
import { RootState, store } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
	items: [],
	promoCode: null,
	discount: 0,
	isCartOpen: false,
};

type CartItemPayload = {
	productId: string;
	size: string;
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (
			state,
			action: PayloadAction<{
				product: Product;
				size: string;
				quantity?: number;
			}>,
		) => {
			const { product, size, quantity = 1 } = action.payload;

			if (quantity <= 0) return;

			const existing = state.items.find(
				(item) => item.product._id === product._id && item.size === size,
			);

			if (existing) {
				existing.quantity += quantity;
			} else {
				state.items.push({
					_id: `${product._id}-${size}`,
					product,
					quantity,
					price: product.price,
					size,
				});
			}
		},

		updateQuantity: (
			state,
			action: PayloadAction<CartItemPayload & { quantity: number }>,
		) => {
			const { productId, size, quantity } = action.payload;

			const item = state.items.find(
				(item) => item.product._id === productId && item.size === size,
			);

			if (!item) return;

			if (quantity <= 0) {
				state.items = state.items.filter(
					(item) => !(item.product._id === productId && item.size === size),
				);
			} else {
				item.quantity = quantity;
			}
		},

		increment: (state, action: PayloadAction<CartItemPayload>) => {
			const { productId, size } = action.payload;

			const item = state.items.find(
				(item) => item.product._id === productId && item.size === size,
			);

			if (item) item.quantity += 1;
		},

		decrement: (state, action: PayloadAction<CartItemPayload>) => {
			const { productId, size } = action.payload;

			const item = state.items.find(
				(item) => item.product._id === productId && item.size === size,
			);

			if (!item) return;

			if (item.quantity <= 1) {
				state.items = state.items.filter(
					(item) => !(item.product._id === productId && item.size === size),
				);
			} else {
				item.quantity -= 1;
			}
		},

		removeFromCart: (state, action: PayloadAction<CartItemPayload>) => {
			const { productId, size } = action.payload;

			state.items = state.items.filter(
				(item) => !(item.product._id === productId && item.size === size),
			);
		},

		clearCart: (state) => {
			state.items = [];
			state.promoCode = null;
			state.discount = 0;
		},

		applyPromo: (
			state,
			action: PayloadAction<{ code: string; discount: number }>,
		) => {
			state.promoCode = action.payload.code;
			state.discount = action.payload.discount;
		},

		removePromo: (state) => {
			state.promoCode = null;
			state.discount = 0;
		},

		setCartOpen: (state, action: PayloadAction<boolean>) => {
			state.isCartOpen = action.payload;
		},
	},
});

export const {
	addToCart,
	updateQuantity,
	increment,
	decrement,
	removeFromCart,
	clearCart,
	applyPromo,
	removePromo,
	setCartOpen,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: RootState): CartItem[] =>
	state.cart.items;

export const selectCartCount = (state: RootState): number =>
	state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state: RootState): number =>
	state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartTotal = (state: RootState): number => {
	const subtotal = selectCartSubtotal(state);
	const discount = state.cart.discount;
	const shipping = subtotal > 0 ? 2 : 0;

	return Math.max(0, subtotal - discount + shipping);
};

export const selectIsInCart =
	(productId: string, size: string) =>
	(state: RootState): boolean =>
		state.cart.items.some(
			(item) => item.product._id === productId && item.size === size,
		);

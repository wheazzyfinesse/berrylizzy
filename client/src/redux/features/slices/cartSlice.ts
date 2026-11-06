import { CartItem, Product } from "@/redux/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { CartItem, Product } from "@/constants/types";

export type CartState = {
	items: CartItem[];
	promoCode: string | null;
	discount: number;
	isCartOpen: boolean; // for bottom sheet / drawer
};

const initialState: CartState = {
	items: [],
	promoCode: null,
	discount: 0,
	isCartOpen: false,
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
			const existing = state.items.find(
				(i) => i.product._id === product._id && i.size === size,
			);
			if (existing) existing.quantity += quantity;
			else
				state.items.push({
					_id: `${product._id}-${size}`,
					product,
					quantity,
					price: product.price,
					size,
				});
		},
		updateQuantity: (
			state,
			action: PayloadAction<{
				productId: string;
				size: string;
				quantity: number;
			}>,
		) => {
			const item = state.items.find(
				(i) =>
					i.product._id === action.payload.productId &&
					i.size === action.payload.size,
			);
			if (!item) return;
			if (action.payload.quantity <= 0)
				state.items = state.items.filter((i) => i !== item);
			else item.quantity = action.payload.quantity;
		},
		increment: (
			state,
			action: PayloadAction<{ productId: string; size: string }>,
		) => {
			const item = state.items.find(
				(i) =>
					i.product._id === action.payload.productId &&
					i.size === action.payload.size,
			);
			if (item) item.quantity += 1;
		},
		decrement: (
			state,
			action: PayloadAction<{ productId: string; size: string }>,
		) => {
			const item = state.items.find(
				(i) =>
					i.product._id === action.payload.productId &&
					i.size === action.payload.size,
			);
			if (!item) return;
			if (item.quantity <= 1)
				state.items = state.items.filter((i) => i !== item);
			else item.quantity -= 1;
		},
		removeFromCart: (
			state,
			action: PayloadAction<{ productId: string; size: string }>,
		) => {
			state.items = state.items.filter(
				(i) =>
					!(
						i.product._id === action.payload.productId &&
						i.size === action.payload.size
					),
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
export const selectCartItems = (s: any) => s.cart.items as CartItem[];
export const selectCartCount = (s: any) =>
	s.cart.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
export const selectCartSubtotal = (s: any) =>
	s.cart.items.reduce(
		(sum: number, i: CartItem) => sum + i.price * i.quantity,
		0,
	);
export const selectCartTotal = (s: any) => {
	const subtotal = selectCartSubtotal(s);
	const discount = s.cart.discount ?? 0;
	const shipping = subtotal > 0 ? 2 : 0;
	return subtotal - discount + shipping;
};
export const selectIsInCart = (productId: string, size: string) => (s: any) =>
	s.cart.items.some(
		(i: CartItem) => i.product._id === productId && i.size === size,
	);

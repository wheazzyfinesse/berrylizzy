import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, WishlistState } from "@/constants/types";
import { RootState } from "@/redux/store";

const initialState: WishlistState = { ids: [], items: [] };

const wishlistSlice = createSlice({
	name: "wishlist",
	initialState,
	reducers: {
		toggleWishlist: (state, action: PayloadAction<Product>) => {
			const idx = state.ids.indexOf(action.payload._id);
			if (idx >= 0) {
				state.ids.splice(idx, 1);
				state.items = state.items.filter((p) => p._id !== action.payload._id);
			} else {
				state.ids.push(action.payload._id);
				state.items.push(action.payload);
			}
		},
		addToWishlist: (state, action: PayloadAction<Product>) => {
			if (!state.ids.includes(action.payload._id)) {
				state.ids.push(action.payload._id);
				state.items.push(action.payload);
			}
		},
		removeFromWishlist: (state, action: PayloadAction<string>) => {
			state.ids = state.ids.filter((id) => id !== action.payload);
			state.items = state.items.filter((p) => p._id !== action.payload);
		},
		clearWishlist: (state) => {
			state.ids = [];
			state.items = [];
		},
		moveToCart: (state, action: PayloadAction<string>) => {
			// Removes from wishlist when moved to cart (cart handles add)
			state.ids = state.ids.filter((id) => id !== action.payload);
			state.items = state.items.filter((p) => p._id !== action.payload);
		},
	},
});

export const {
	toggleWishlist,
	addToWishlist,
	removeFromWishlist,
	clearWishlist,
	moveToCart,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectWishlistItems = (s: any) => s.wishlist.items as Product[];
export const selectWishlistIds = (s: any) => s.wishlist.ids as string[];
export const isInWishlist = (id: string) => (s: any) =>
	s.wishlist.ids.includes(id);
export const selectWishlistCount = (state: RootState) =>
	state.wishlist.items.length;

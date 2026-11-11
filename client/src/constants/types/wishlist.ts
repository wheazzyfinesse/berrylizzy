import type { ID } from "./common";
import type { Product } from "./product";

export type Wishlist = Product[];

export interface AddToWishlistInput {
	productId: ID;
}
export type WishlistState = { ids: string[]; items: Product[] };

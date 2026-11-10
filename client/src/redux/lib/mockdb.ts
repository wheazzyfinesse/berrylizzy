import {
	dummyAddress,
	dummyCart,
	dummyOrders,
	dummyProducts,
	dummyUser,
	dummyWishlist,
} from "@/constants/dummyData";
import { Address, Cart, Order, Product, User } from "@/constants/types";

// Deep clone so we don't mutate the original file
export const mockDb = {
	products: JSON.parse(JSON.stringify(dummyProducts)) as Product[],
	cart: JSON.parse(JSON.stringify(dummyCart)) as Cart,
	wishlist: JSON.parse(JSON.stringify(dummyWishlist)) as Product[],
	orders: JSON.parse(JSON.stringify(dummyOrders)) as Order[],
	addresses: JSON.parse(JSON.stringify(dummyAddress)) as Address[],
	user: JSON.parse(JSON.stringify(dummyUser)) as User,
};

export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const recalcCart = () => {
	mockDb.cart.totalAmount = mockDb.cart.items.reduce(
		(state: any, item: any) => state + item.price * item.quantity,
		0,
	);
};

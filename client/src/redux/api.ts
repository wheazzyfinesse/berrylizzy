import {
	createApi,
	fetchBaseQuery,
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { delay, mockDb } from "./lib/mockdb";
import * as SecureStore from "expo-secure-store";

export const USE_DUMMY = true;
export const API_URL = "https://your-api.com/api";

const realBaseQuery = fetchBaseQuery({
	baseUrl: API_URL,
	prepareHeaders: async (headers) => {
		// const token = await AsyncStorage.getItem("token");
		const token = await SecureStore.getItemAsync("access_token");
		if (token) headers.set("Authorization", `Bearer ${token}`);
		return headers;
	},
});

const baseQueryWithMock: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	if (!USE_DUMMY) return realBaseQuery(args, api, extraOptions);
	await delay(300);
	const url = typeof args === "string" ? args : args.url;
	const method = typeof args === "string" ? "GET" : (args.method ?? "GET");
	const body = typeof args !== "string" ? (args.body as any) : undefined;
	const params = typeof args !== "string" ? (args.params as any) : {};

	// ---------- PRODUCTS ----------
	if (url.startsWith("/products")) {
		const id = url.split("/")[2];
		if (method === "GET") {
			if (id && id !== "featured" && id !== "search") {
				const p = mockDb.products.find((x) => x._id === id);
				return p ? { data: p } : { error: { status: 404, data: "Not found" } };
			}
			let data = [...mockDb.products];
			if (params?.category)
				data = data.filter((p) => p.category === params.category);
			if (params?.featured || url.includes("featured"))
				data = data.filter((p) => p.isFeatured);
			if (params?.search)
				data = data.filter((p) =>
					p.name.toLowerCase().includes(params.search.toLowerCase()),
				);
			return { data };
		}
		if (method === "POST") {
			const newP = {
				...body,
				_id: Date.now().toString(),
				ratings: { average: 0, count: 0 },
				createdAt: new Date().toISOString(),
				isActive: true,
			};
			mockDb.products.unshift(newP);
			return { data: newP };
		}
		if (method === "PATCH" || method === "PUT") {
			const idx = mockDb.products.findIndex((p) => p._id === id);
			if (idx >= 0) {
				mockDb.products[idx] = { ...mockDb.products[idx], ...body };
				return { data: mockDb.products[idx] };
			}
			return { error: { status: 404, data: "Not found" } };
		}
		if (method === "DELETE") {
			mockDb.products = mockDb.products.filter((p) => p._id !== id);
			return { data: { success: true } };
		}
	}

	// ---------- ORDERS ----------
	if (url.startsWith("/orders")) {
		const id = url.split("/")[2];
		if (method === "GET") {
			if (id) {
				const o = mockDb.orders.find((x) => x._id === id);
				return o ? { data: o } : { error: { status: 404, data: "Not found" } };
			}
			return { data: mockDb.orders };
		}
		if (method === "POST") {
			const newOrder = {
				...body,
				_id: Date.now().toString(),
				orderNumber: `ORD-${Date.now()}`,
				createdAt: new Date().toISOString(),
			};
			mockDb.orders.unshift(newOrder);
			return { data: newOrder };
		}
		if (method === "PATCH") {
			const idx = mockDb.orders.findIndex((o) => o._id === id);
			if (idx >= 0) {
				mockDb.orders[idx] = { ...mockDb.orders[idx], ...body };
				return { data: mockDb.orders[idx] };
			}
		}
		if (method === "DELETE") {
			mockDb.orders = mockDb.orders.filter((o) => o._id !== id);
			return { data: { success: true } };
		}
	}

	// ---------- USERS ----------
	if (url.startsWith("/users")) {
		const id = url.split("/")[2];
		if (method === "GET") {
			// 1. Logged in user - single object
			if (url === "/users/me" || url === "/users/profile") {
				return { data: mockDb.user };
			}
			// 2. Get user by id - single object
			if (id) {
				const u = mockDb.user._id === id ? mockDb.user : null;
				return u
					? { data: u }
					: { error: { status: 404, data: "User not found" } };
			}
			// 3. Admin - get ALL users - fake it as array with just the logged-in user
			// In real backend this will return real array from MongoDB
			return { data: [mockDb.user] };
		}
		if (method === "PATCH" || method === "PUT") {
			mockDb.user = { ...mockDb.user, ...body };
			return { data: mockDb.user };
		}
		if (method === "DELETE") return { data: { success: true } };
	}
	// ---------- ADDRESSES ----------
	if (url.startsWith("/addresses")) {
		const id = url.split("/")[2];
		if (method === "GET") {
			if (id) {
				const a = mockDb.addresses.find((x) => x._id === id);
				return { data: a };
			}
			return { data: mockDb.addresses };
		}
		if (method === "POST") {
			const na = { ...body, _id: Date.now().toString() };
			mockDb.addresses.push(na);
			return { data: na };
		}
		if (method === "PATCH") {
			const idx = mockDb.addresses.findIndex((a) => a._id === id);
			if (idx >= 0) {
				mockDb.addresses[idx] = { ...mockDb.addresses[idx], ...body };
				return { data: mockDb.addresses[idx] };
			}
		}
		if (method === "DELETE") {
			mockDb.addresses = mockDb.addresses.filter((a) => a._id !== id);
			return { data: { success: true } };
		}
	}

	// ---------- WISHLIST ----------
	if (url.startsWith("/wishlist")) {
		if (method === "GET") return { data: mockDb.wishlist };
		if (method === "POST") {
			const p = mockDb.products.find((x) => x._id === body.productId);
			if (p && !mockDb.wishlist.find((x) => x._id === p._id))
				mockDb.wishlist.push(p);
			return { data: mockDb.wishlist };
		}
		if (method === "DELETE") {
			const pid = url.split("/")[2] ?? body?.productId;
			mockDb.wishlist = mockDb.wishlist.filter((p) => p._id !== pid);
			return { data: mockDb.wishlist };
		}
	}

	// ---------- CART (backend sync only) ----------
	if (url.startsWith("/cart")) {
		if (method === "GET") return { data: mockDb.cart };
		if (method === "POST" || method === "PATCH") return { data: mockDb.cart };
		if (method === "DELETE") {
			mockDb.cart.items = [];
			mockDb.cart.totalAmount = 0;
			return { data: { success: true } };
		}
	}

	return { data: [] };
};

export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithMock,
	tagTypes: ["Product", "Order", "User", "Address", "Wishlist", "Cart"],
	endpoints: () => ({}),
});

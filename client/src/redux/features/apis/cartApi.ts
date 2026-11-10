import { Cart } from "@/constants/types";
import { baseApi } from "./api";

export const cartApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getCart: builder.query<Cart, void>({
			query: () => "/cart",
			providesTags: ["Cart"],
		}),
		syncCart: builder.mutation<
			Cart,
			{ items: { productId: string; quantity: number; size: string }[] }
		>({
			query: (body) => ({ url: "/cart/sync", method: "POST", body }),
			invalidatesTags: ["Cart"],
		}),
		clearCartBackend: builder.mutation<{ success: boolean }, void>({
			query: () => ({ url: "/cart/clear", method: "DELETE" }),
			invalidatesTags: ["Cart"],
		}),
	}),
});

export const {
	useGetCartQuery,
	useSyncCartMutation,
	useClearCartBackendMutation,
} = cartApi;

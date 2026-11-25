import {
	Order,
	CreateOrderRequest,
	CreatePendingOrderResponse,
} from "@/constants/types";
import { baseApi } from "./api";

export const ordersApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getOrders: builder.query<Order[], void>({
			query: () => "/orders",
			providesTags: (r) =>
				r
					? [...r.map((o) => ({ type: "Order" as const, id: o._id })), "Order"]
					: ["Order"],
		}),
		getMyOrder: builder.query<Order[], void>({
			query: () => "/orders/mine",
			providesTags: (r) =>
				r
					? [...r.map((o) => ({ type: "Order" as const, id: o._id })), "Order"]
					: ["Order"],
		}),
		getOrder: builder.query<Order, string>({
			query: (id) => `/orders/${id}`,
			providesTags: (r, e, id) => [{ type: "Order", id }],
		}),
		createPendingOrder: builder.mutation<
			CreatePendingOrderResponse,
			CreateOrderRequest
		>({
			query: (body) => ({ url: "/orders", method: "POST", body }),
			invalidatesTags: ["Order", "Cart"],
		}),
		verifyPaystackPayment: builder.mutation<CreatePendingOrderResponse, any>({
			query: (body) => ({
				url: "/orders/paystack/verify",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Order", "Cart"],
		}),
		deleteOrder: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({ url: `/orders/${id}`, method: "DELETE" }),
			invalidatesTags: ["Order"],
		}),
	}),
});

export const {
	useGetOrdersQuery,
	useGetOrderQuery,
	useGetMyOrderQuery,
	useCreatePendingOrderMutation,
	useVerifyPaystackPaymentMutation,
	useDeleteOrderMutation,
} = ordersApi;

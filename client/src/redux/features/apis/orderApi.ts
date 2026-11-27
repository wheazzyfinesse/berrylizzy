import {
	Order,
	CreateOrderRequest,
	CreatePendingOrderResponse,
	UpdateOrderRequest,
} from "@/constants/types";
import { baseApi } from "./api";

export const ordersApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getOrders: builder.query<Order[], void>({
			query: () => "/orders",
			providesTags: (result) =>
				result
					? [
							...result.map((order) => ({
								type: "Order" as const,
								id: order._id,
							})),
							"Order",
						]
					: ["Order"],
		}),
		getMyOrders: builder.query<Order[], void>({
			query: () => "/orders/mine",
			providesTags: (result) =>
				result
					? [
							...result.map((order) => ({
								type: "Order" as const,
								id: order._id,
							})),
							"Order",
						]
					: ["Order"],
		}),
		getOrder: builder.query<Order, string>({
			query: (id) => `/orders/${id}`,
			providesTags: (result, error, id) => [{ type: "Order", id }],
		}),
		createPendingOrder: builder.mutation<
			CreatePendingOrderResponse,
			CreateOrderRequest
		>({
			query: (body) => ({ url: "/orders", method: "POST", body }),
			invalidatesTags: ["Order", "Cart"],
		}),
		updateOrder: builder.mutation<Order, UpdateOrderRequest>({
			query: ({ id, data }) => ({
				url: `/orders/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Order", id },
				"Order",
			],
		}),
		cancelMyOrder: builder.mutation<string, string>({
			query: (id) => ({ url: `/orders/mine/${id}/cancel`, method: "POST" }),
			invalidatesTags: ["Order"],
		}),
		retryOrderPayment: builder.mutation<string, string>({
			query: (id) => ({
				url: `/orders/mine/${id}/retry-payment`,
				method: "POST",
			}),
			invalidatesTags: ["Order"],
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
	useGetMyOrdersQuery,
	useCreatePendingOrderMutation,
	useUpdateOrderMutation,
	useCancelMyOrderMutation,
	useRetryOrderPaymentMutation,
	useDeleteOrderMutation,
} = ordersApi;

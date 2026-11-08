import { Order, Address, CartItem } from "@/constants/types";
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
		getOrderById: builder.query<Order, string>({
			query: (id) => `/orders/${id}`,
			providesTags: (r, e, id) => [{ type: "Order", id }],
		}),
		getMyOrders: builder.query<Order[], void>({
			query: () => "/orders/my",
			providesTags: ["Order"],
		}),
		createOrder: builder.mutation<
			Order,
			{
				items: CartItem[];
				shippingAddress: Address;
				paymentMethod: "cash" | "stripe";
				notes?: string;
			}
		>({
			query: (body) => ({ url: "/orders", method: "POST", body }),
			invalidatesTags: ["Order", "Cart"],
		}),
		updateOrderStatus: builder.mutation<
			Order,
			{ id: string; orderStatus: Order["orderStatus"] }
		>({
			query: ({ id, orderStatus }) => ({
				url: `/orders/${id}`,
				method: "PATCH",
				body: { orderStatus },
			}),
			invalidatesTags: (r, e, { id }) => [{ type: "Order", id }],
		}),
		updatePaymentStatus: builder.mutation<
			Order,
			{ id: string; paymentStatus: Order["paymentStatus"] }
		>({
			query: ({ id, paymentStatus }) => ({
				url: `/orders/${id}`,
				method: "PATCH",
				body: { paymentStatus },
			}),
			invalidatesTags: (r, e, { id }) => [{ type: "Order", id }],
		}),
		cancelOrder: builder.mutation<Order, string>({
			query: (id) => ({
				url: `/orders/${id}`,
				method: "PATCH",
				body: { orderStatus: "cancelled" },
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
	useGetOrderByIdQuery,
	useGetMyOrdersQuery,
	useCreateOrderMutation,
	useUpdateOrderStatusMutation,
	useUpdatePaymentStatusMutation,
	useCancelOrderMutation,
	useDeleteOrderMutation,
} = ordersApi;

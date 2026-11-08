import { Address } from "@/constants/types";
import { baseApi } from "./api";

export const addressApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAddresses: builder.query<Address[], void>({
			query: () => "/addresses",
			providesTags: (r) =>
				r
					? [
							...r.map((a) => ({ type: "Address" as const, id: a._id })),
							"Address",
						]
					: ["Address"],
		}),
		getAddressById: builder.query<Address, string>({
			query: (id) => `/addresses/${id}`,
			providesTags: (r, e, id) => [{ type: "Address", id }],
		}),
		addAddress: builder.mutation<Address, Omit<Address, "_id">>({
			query: (body) => ({ url: "/addresses", method: "POST", body }),
			invalidatesTags: ["Address"],
		}),
		updateAddress: builder.mutation<
			Address,
			{ id: string; data: Partial<Address> }
		>({
			query: ({ id, data }) => ({
				url: `/addresses/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),
		setDefaultAddress: builder.mutation<Address, string>({
			query: (id) => ({
				url: `/addresses/${id}`,
				method: "PATCH",
				body: { isDefault: true },
			}),
			invalidatesTags: ["Address"],
		}),
		deleteAddress: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({ url: `/addresses/${id}`, method: "DELETE" }),
			invalidatesTags: ["Address"],
		}),
	}),
});

export const {
	useGetAddressesQuery,
	useGetAddressByIdQuery,
	useAddAddressMutation,
	useUpdateAddressMutation,
	useSetDefaultAddressMutation,
	useDeleteAddressMutation,
} = addressApi;

import type {
	AddAddressRequest,
	Address,
	ID,
	UpdateAddressInput,
} from "@/constants/types";
import { baseApi } from "./api";

export const addressApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAddresses: builder.query<Address[], void>({
			query: () => "/addresses",
			providesTags: (result) =>
				result
					? [
							...result.map((a) => ({ type: "Address" as const, id: a._id })),
							"Address",
						]
					: ["Address"],
		}),
		getAddressById: builder.query<Address, ID>({
			query: (id) => `/addresses/${id}`,
			providesTags: (r, e, id) => [{ type: "Address", id }],
		}),
		addAddress: builder.mutation<Address, AddAddressRequest>({
			query: (body) => ({ url: "/addresses", method: "POST", body }),
			invalidatesTags: ["Address"],
		}),
		updateAddress: builder.mutation<
			Address,
			{ id: string; data: UpdateAddressInput }
		>({
			query: ({ id, data }) => ({
				url: `/addresses/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),
		setDefaultAddress: builder.mutation<Address, ID>({
			query: (id) => ({
				url: `/addresses/${id}`,
				method: "PATCH",
				body: { isDefault: true },
			}),
			invalidatesTags: ["Address"],
		}),
		deleteAddress: builder.mutation<{ success: boolean }, ID>({
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

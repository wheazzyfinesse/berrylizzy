import type {
	AddAddressRequest,
	Address,
	AddressApiResponse,
	ApiResponse,
	UpdateAddressInput,
} from "@/constants/types";
import { baseApi } from "./api";

export const addressApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAddresses: builder.query<AddressApiResponse, void>({
			query: () => "/addresses",
			providesTags: (r) =>
				r
					? [
							...r.data.map((a) => ({ type: "Address" as const, id: a._id })),
							"Address",
						]
					: ["Address"],
		}),
		getAddressById: builder.query<ApiResponse, string>({
			query: (id) => `/addresses/${id}`,
			providesTags: (r, e, id) => [{ type: "Address", id }],
		}),
		addAddress: builder.mutation<ApiResponse, AddAddressRequest>({
			query: (body) => ({ url: "/addresses", method: "POST", body }),
			invalidatesTags: ["Address"],
		}),
		updateAddress: builder.mutation<
			ApiResponse,
			{ id: string; data: UpdateAddressInput }
		>({
			query: ({ id, data }) => ({
				url: `/addresses/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),
		setDefaultAddress: builder.mutation<ApiResponse, string>({
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

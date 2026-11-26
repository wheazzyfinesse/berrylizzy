import { Product, ID, ProductApiResponse } from "@/constants/types";
import { baseApi } from "./api";

export type ProductFilters = {
	category?: string;
	search?: string;
	featured?: boolean;
	limit?: number;
	page?: number;
};
export type UpdateProduct = { id: string; formData: FormData };

export const productsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// QUERIES
		getProducts: builder.query<ProductApiResponse, ProductFilters | void>({
			query: (args) => ({
				url: "/products",
				params: {
					page: 1,
					limit: 10,
					...args,
				},
			}),
			providesTags: (result) =>
				result
					? [
							...result.products.map((product) => ({
								type: "Product" as const,
								id: product._id,
							})),
							"Product",
						]
					: ["Product"],
		}),
		getProduct: builder.query<Product, ID>({
			query: (id) => `/products/${id}`,
			providesTags: (r, e, id) => [{ type: "Product", id }],
		}),

		// MUTATIONS
		createProduct: builder.mutation<Product, FormData>({
			query: (body) => ({ url: "/products", method: "POST", body }),
			invalidatesTags: ["Product"],
		}),
		updateProduct: builder.mutation<Product, UpdateProduct>({
			query: ({ id, formData }) => ({
				url: `/products/${id}`,
				method: "PUT",
				body: formData,
			}),
			invalidatesTags: (r, e, { id }) => [{ type: "Product", id }, "Product"],
		}),
		deleteProduct: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
			invalidatesTags: ["Product"],
		}),
	}),
});

export const {
	useGetProductsQuery,
	useGetProductQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
} = productsApi;

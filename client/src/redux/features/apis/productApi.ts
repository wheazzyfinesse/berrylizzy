// import { baseApi } from '@/store/baseApi';
import { Product } from "@/redux/lib/types";
import { baseApi } from "../../api";

export type ProductInput = Omit<Product, "_id" | "ratings" | "createdAt">;
export type ProductFilters = {
	category?: string;
	search?: string;
	featured?: boolean;
	limit?: number;
};
export type UpdateProduct = { id: string; data: Partial<ProductInput> };

export const productsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// QUERIES
		getProducts: builder.query<Product[], ProductFilters | void>({
			query: (args) => ({ url: "/products", params: args ?? {} }),
			providesTags: (r) =>
				r
					? [
							...r.map((p) => ({ type: "Product" as const, id: p._id })),
							"Product",
						]
					: ["Product"],
		}),
		getProductById: builder.query<Product, string>({
			query: (id) => `/products/${id}`,
			providesTags: (r, e, id) => [{ type: "Product", id }],
		}),
		getFeaturedProducts: builder.query<Product[], void>({
			query: () => ({ url: "/products", params: { featured: true } }),
			providesTags: ["Product"],
		}),
		getProductsByCategory: builder.query<Product[], string>({
			query: (category) => ({ url: "/products", params: { category } }),
			providesTags: ["Product"],
		}),
		searchProducts: builder.query<Product[], string>({
			query: (search) => ({ url: "/products", params: { search } }),
			providesTags: ["Product"],
		}),

		// MUTATIONS
		addProduct: builder.mutation<Product, ProductInput>({
			query: (body) => ({ url: "/products", method: "POST", body }),
			invalidatesTags: ["Product"],
		}),
		updateProduct: builder.mutation<Product, UpdateProduct>({
			query: ({ id, data }) => ({
				url: `/products/${id}`,
				method: "PATCH",
				body: data,
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
	useGetProductByIdQuery,
	useGetFeaturedProductsQuery,
	useGetProductsByCategoryQuery,
	useSearchProductsQuery,
	useAddProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
} = productsApi;

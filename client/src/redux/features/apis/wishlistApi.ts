// import { baseApi } from '@/store/baseApi';
import { Product } from "@/constants/types";
import { baseApi } from "../../api";

export const wishlistApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getWishlist: builder.query<Product[], void>({
			query: () => "/wishlist",
			providesTags: ["Wishlist"],
		}),
		addToWishlist: builder.mutation<Product[], string>({
			query: (productId) => ({
				url: "/wishlist",
				method: "POST",
				body: { productId },
			}),
			invalidatesTags: ["Wishlist"],
		}),
		removeFromWishlist: builder.mutation<Product[], string>({
			query: (productId) => ({
				url: `/wishlist/${productId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Wishlist"],
		}),
		toggleWishlist: builder.mutation<
			Product[],
			{ productId: string; isInWishlist: boolean }
		>({
			query: ({ productId, isInWishlist }) =>
				isInWishlist
					? { url: `/wishlist/${productId}`, method: "DELETE" }
					: { url: "/wishlist", method: "POST", body: { productId } },
			invalidatesTags: ["Wishlist"],
		}),
		clearWishlist: builder.mutation<{ success: boolean }, void>({
			query: () => ({ url: "/wishlist/clear", method: "DELETE" }),
			invalidatesTags: ["Wishlist"],
		}),
	}),
});

export const {
	useGetWishlistQuery,
	useAddToWishlistMutation,
	useRemoveFromWishlistMutation,
	useToggleWishlistMutation,
	useClearWishlistMutation,
} = wishlistApi;

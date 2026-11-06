import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

const WishlistContext = createContext<WishlistContextType | undefined>(
	undefined,
);

export const wishlistProvider = ({ children }: { children: ReactNode }) => {
	const [wishlist, setWishlist] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchWishlist = () => {
		setLoading(true);
		setWishlist(dummyWishlist);
		setLoading(false);
	};

	const toggleWishlist = (product: Product) => {
		setWishlist((previousWishlist) => {
			const wishlistProductExists = wishlist.find(
				(wishlistProduct) => wishlistProduct._id === product._id,
			);

			return wishlistProductExists
				? previousWishlist.filter(
						(previousWishlistProduct) =>
							previousWishlistProduct._id !== product._id,
					)
				: [...previousWishlist, product];
		});
	};
	const isInWishlist = (productId: string) => {
		return wishlist.some(
			(wishlistProduct) => wishlistProduct._id === productId,
		);
	};

	useEffect(() => {
		fetchWishlist();
	}, []);

	return (
		<WishlistContext.Provider
			value={{ wishlist, loading, isInWishlist, toggleWishlist }}
		>
			{children}
		</WishlistContext.Provider>
	);
};
export const useWishlist = () => {
	const context = useContext(WishlistContext);
	if (!context || context === undefined) {
		throw new Error("useWishlist must be used within a WishlistProvider");
	}
	return context;
};

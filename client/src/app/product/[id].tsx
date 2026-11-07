import Error from "@/components/Error";
import Loading from "@/components/Loading";
import { COLORS } from "@/constants";
import { useGetProductByIdQuery } from "@/redux/features/apis/productApi";
import {
	addToCart,
	removeFromCart,
	selectCartCount,
	selectIsInCart,
} from "@/redux/features/slices/cartSlice";
import {
	isInWishlist,
	toggleWishlist,
} from "@/redux/features/slices/wishlistSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
	View,
	ScrollView,
	Dimensions,
	Image,
	TouchableOpacity,
	Text,
} from "react-native";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const ProductDetails = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const dispatch = useAppDispatch();

	const isLiked = useAppSelector(isInWishlist(id));
	const cartCount = useAppSelector(selectCartCount);

	const { data: product, isLoading, refetch } = useGetProductByIdQuery(id);

	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);

	const isItemInCart = useAppSelector(
		selectIsInCart(product?._id ?? "", selectedSize ?? "One Size"),
	);
	if (isLoading) return <Loading />;
	if (!product) return <Error message="No product found" />;

	const incrementQuantity = () => {
		setQuantity((previous) => previous + 1);
	};

	const decrementQuantity = () => {
		setQuantity((previous) => Math.max(1, previous - 1));
	};

	const handleAddToCart = () => {
		if (product.sizes?.length && !selectedSize) {
			Toast.show({
				type: "error",
				text1: "Select a size",
				text2: "Please select your preferred size first.",
			});
			return;
		}

		dispatch(
			addToCart({
				product,
				size: selectedSize ?? "One Size",
				quantity,
			}),
		);

		Toast.show({
			type: "success",
			text1: "Added to cart",
			text2: `${quantity} × ${product.name} added successfully.`,
		});
	};

	const handleCartAction = () => {
		if (isItemInCart) {
			router.push("/(tabs)/cart");
			return;
		}

		handleAddToCart();
	};
	return (
		<View className="flex-1 bg-white">
			<ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
				{/* Image carousel */}
				<View className="relative h-[450px] bg-gray-100 mb-6">
					<ScrollView
						pagingEnabled
						horizontal
						showsHorizontalScrollIndicator={false}
						scrollEventThrottle={16}
						onScroll={(event) => {
							const slide = Math.round(
								event.nativeEvent.contentOffset.x /
									event.nativeEvent.layoutMeasurement.width,
							);
							setActiveImageIndex(slide);
						}}
					>
						{product.images?.map((img, index) => (
							<Image
								key={`${img}-${index}`}
								source={{ uri: img }}
								style={{ width, height: 450 }}
								resizeMode="cover"
							/>
						))}
					</ScrollView>

					{/* Header actions */}
					<View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-20">
						<TouchableOpacity
							onPress={() => router.back()}
							className="w-10 h-10 bg-white/80 rounded-full items-center justify-center"
						>
							<Ionicons name="arrow-back" size={24} color={COLORS.primary} />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => dispatch(toggleWishlist(product))}
							className="w-10 h-10 bg-white/80 rounded-full items-center justify-center"
						>
							<Ionicons
								name={isLiked ? "heart" : "heart-outline"}
								size={24}
								color={isLiked ? COLORS.accent : COLORS.primary}
							/>
						</TouchableOpacity>
					</View>

					{/* Pagination */}
					<View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
						{product.images?.map((_, index) => (
							<View
								key={index}
								className={`h-2 rounded-full ${
									index === activeImageIndex
										? "w-6 bg-primary"
										: "w-2 bg-gray-300"
								}`}
							/>
						))}
					</View>
				</View>

				{/* Product information */}
				<View className="px-5">
					<View className="flex-row justify-between items-start mb-2">
						<Text className="text-2xl font-bold text-primary flex-1 mr-4">
							{product.name}
						</Text>

						<View className="flex-row items-center">
							<Ionicons name="star" size={14} color="#ffd700" />
							<Text className="text-sm font-bold ml-1">4.6</Text>
							<Text className="text-xs text-secondary ml-1">(85)</Text>
						</View>
					</View>

					<Text className="text-2xl text-primary font-bold mb-4">
						${product.price.toFixed(2)}
					</Text>

					{/* Size selection */}
					{product.sizes?.length > 0 && (
						<View className="mb-5">
							<Text className="text-base text-primary font-bold mb-3">
								Select size
							</Text>

							<View className="flex-row gap-3 flex-wrap">
								{product.sizes.map((size) => (
									<TouchableOpacity
										key={size}
										onPress={() => setSelectedSize(size)}
										className={`w-12 h-12 rounded-full justify-center items-center border ${
											selectedSize === size
												? "bg-primary border-primary"
												: "bg-white border-gray-200"
										}`}
									>
										<Text
											className={`text-sm font-medium ${
												selectedSize === size ? "text-white" : "text-primary"
											}`}
										>
											{size}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					)}

					{/* Quantity selection */}
					<View className="mb-5">
						<Text className="text-base font-bold text-primary mb-3">
							Quantity
						</Text>

						<View className="flex-row items-center">
							<TouchableOpacity
								onPress={decrementQuantity}
								disabled={quantity === 1}
								className={`w-10 h-10 rounded-full border border-gray-200 items-center justify-center ${
									quantity === 1 ? "opacity-40" : ""
								}`}
							>
								<Ionicons name="remove" size={20} color={COLORS.primary} />
							</TouchableOpacity>

							<Text className="text-lg font-bold text-primary mx-5">
								{quantity}
							</Text>

							<TouchableOpacity
								onPress={incrementQuantity}
								className="w-10 h-10 rounded-full border border-gray-200 items-center justify-center"
							>
								<Ionicons name="add" size={20} color={COLORS.primary} />
							</TouchableOpacity>
						</View>
					</View>

					{/* Description */}
					<Text className="text-base font-bold text-primary mb-2">
						Description
					</Text>
					<Text className="text-secondary leading-6 mb-6">
						{product.description}
					</Text>
				</View>
			</ScrollView>

			{/* Bottom actions */}
			<View className="absolute bottom-0 left-0 right-0 flex-row items-center p-4 bg-white border-t border-gray-100">
				<TouchableOpacity
					onPress={handleCartAction}
					className={`flex-1 py-4 rounded-full items-center justify-center flex-row mr-3 ${
						isItemInCart ? "bg-green-600" : "bg-primary"
					}`}
				>
					<Ionicons
						name={isItemInCart ? "cart" : "bag-outline"}
						size={20}
						color="white"
					/>

					<Text className="text-white font-bold text-base ml-2">
						{isItemInCart ? "Go to Cart" : "Add to Cart"}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => router.push("/(tabs)/cart")}
					className="w-12 h-12 items-center justify-center relative"
				>
					<Ionicons name="cart-outline" size={25} color={COLORS.primary} />

					{cartCount > 0 && (
						<View className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-black rounded-full items-center justify-center">
							<Text className="text-white text-[9px] font-bold">
								{cartCount > 99 ? "99+" : cartCount}
							</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default ProductDetails;

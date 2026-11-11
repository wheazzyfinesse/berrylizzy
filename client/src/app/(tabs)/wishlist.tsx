import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { COLORS } from "@/constants";
import { Product } from "@/constants/types";
import {
	clearWishlist,
	removeFromWishlist,
	selectWishlistItems,
} from "@/redux/features/slices/wishlistSlice";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { addToCart } from "@/redux/features/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";

const Wishlist = () => {
	const dispatch = useAppDispatch();
	const wishlistItems = useAppSelector(selectWishlistItems);

	const renderItem = ({ item }: { item: Product }) => (
		<View className="flex-row bg-white rounded-xl p-3 mb-3">
			<Image
				source={{ uri: item.images?.[0] }}
				className="w-24 h-28 rounded-lg"
				resizeMode="cover"
			/>

			<View className="flex-1 ml-3 justify-between">
				<View>
					<Text className="text-base font-semibold text-gray-900">
						{item.name}
					</Text>

					<Text className="text-sm text-gray-500 mt-1">
						€{item.price.toFixed(2)}
					</Text>
				</View>

				<View className="flex-row items-center justify-between">
					<TouchableOpacity
						onPress={() => {
							dispatch(
								addToCart({
									product: item,
									size: item.sizes[0],
									quantity: 1,
								}),
							);

							dispatch(removeFromWishlist(item._id));
						}}
						className="bg-black px-4 py-2 rounded-lg"
					>
						<Text className="text-white text-xs font-semibold">
							Move to Cart
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => dispatch(removeFromWishlist(item._id))}
						className="p-2"
					>
						<Ionicons name="trash-outline" size={20} color={COLORS.primary} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
			<View className="flex-1 bg-surface px-4 pt-4">
				<View className="flex-row justify-between items-center mb-5">
					<View>
						<Text className="text-xl font-bold text-gray-900">My Wishlist</Text>
						<Text className="text-sm text-gray-500 mt-1">
							{wishlistItems.length} saved items
						</Text>
					</View>

					{wishlistItems.length > 0 && (
						<TouchableOpacity onPress={() => dispatch(clearWishlist())}>
							<Text className="text-sm font-semibold text-red-500">
								Clear All
							</Text>
						</TouchableOpacity>
					)}
				</View>

				{wishlistItems.length === 0 ? (
					<View className="flex-1 justify-center items-center">
						<Ionicons name="heart-outline" size={60} color="#9CA3AF" />

						<Text className="text-lg font-semibold text-gray-800 mt-4">
							Your wishlist is empty
						</Text>

						<Text className="text-sm text-gray-500 mt-2 text-center">
							Save your favourite products and they will appear here.
						</Text>
					</View>
				) : (
					<FlatList
						data={wishlistItems}
						keyExtractor={(item) => item._id}
						renderItem={renderItem}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</SafeAreaView>
	);
};

export default Wishlist;

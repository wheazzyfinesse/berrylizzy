import Header from "@/components/Header";
import { COLORS } from "@/constants";
import {
	clearCart,
	decrement,
	increment,
	removeFromCart,
	selectCartItems,
	selectCartSubtotal,
	selectCartTotal,
} from "@/redux/features/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Cart = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const cartItems = useAppSelector(selectCartItems);
	const subtotal = useAppSelector(selectCartSubtotal);
	const total = useAppSelector(selectCartTotal);

	const handleIncrement = (productId: string, size: string) => {
		dispatch(increment({ productId, size }));
	};

	const handleDecrement = (
		productId: string,
		size: string,
		quantity: number,
	) => {
		if (quantity <= 1) return;
		dispatch(decrement({ productId, size }));
	};

	const handleRemove = (productId: string, size: string) => {
		dispatch(removeFromCart({ productId, size }));

		Toast.show({
			type: "success",
			text1: "Item removed",
			text2: "The item has been removed from your cart.",
		});
	};

	if (cartItems.length === 0) {
		return (
			<View className="flex-1 bg-white items-center justify-center px-6">
				<Ionicons name="bag-outline" size={75} color={COLORS.secondary} />

				<Text className="text-xl font-bold text-primary mt-5">
					Your cart is empty
				</Text>

				<Text className="text-secondary text-center mt-2 mb-6">
					You haven't added any products to your cart yet.
				</Text>

				<TouchableOpacity
					onPress={() => router.push("/shop")}
					className="bg-primary px-8 py-4 rounded-full"
				>
					<Text className="text-white font-bold">Start shopping</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Header */}
			<Header title="My Cart" showBack showCart />
			<View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
				<Text className="text-sm text-secondary mt-1">
					{cartItems.length} {cartItems.length === 1 ? "item" : "items"}
				</Text>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
			>
				{/* Cart items */}
				{cartItems.map((item) => (
					<View
						key={item._id}
						className="flex-row py-4 border-b border-gray-100"
					>
						<TouchableOpacity
							onPress={() =>
								router.push({
									pathname: "/product/[id]",
									params: { id: item.product._id },
								})
							}
						>
							<Image
								source={{ uri: item.product.images?.[0] }}
								className="w-24 h-28 rounded-xl bg-gray-100"
								resizeMode="cover"
							/>
						</TouchableOpacity>

						<View className="flex-1 ml-4 justify-between">
							<View>
								<View className="flex-row justify-between items-start">
									<Text
										className="text-base font-bold text-primary flex-1 mr-2"
										numberOfLines={2}
									>
										{item.product.name}
									</Text>

									<TouchableOpacity
										onPress={() => handleRemove(item.product._id, item.size)}
									>
										<Ionicons name="trash-outline" size={20} color="#ef4444" />
									</TouchableOpacity>
								</View>

								<Text className="text-sm text-secondary mt-1">
									Size: {item.size}
								</Text>

								<Text className="text-base font-bold text-primary mt-2">
									${item.price.toFixed(2)}
								</Text>
							</View>

							{/* Quantity controls */}
							<View className="flex-row items-center mt-3">
								<TouchableOpacity
									onPress={() =>
										handleDecrement(item.product._id, item.size, item.quantity)
									}
									disabled={item.quantity <= 1}
									className={`w-8 h-8 rounded-full border border-gray-200 items-center justify-center ${
										item.quantity <= 1 ? "opacity-40" : ""
									}`}
								>
									<Ionicons name="remove" size={16} color={COLORS.primary} />
								</TouchableOpacity>

								<Text className="text-base font-bold text-primary mx-4">
									{item.quantity}
								</Text>

								<TouchableOpacity
									onPress={() => handleIncrement(item.product._id, item.size)}
									className="w-8 h-8 rounded-full border border-gray-200 items-center justify-center"
								>
									<Ionicons name="add" size={16} color={COLORS.primary} />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				))}

				{/* Order summary */}
				<View className="mt-6">
					<Text className="text-lg font-bold text-primary mb-4">
						Order Summary
					</Text>

					<View className="flex-row justify-between mb-3">
						<Text className="text-secondary">Subtotal</Text>
						<Text className="text-primary font-semibold">
							${subtotal.toFixed(2)}
						</Text>
					</View>

					<View className="flex-row justify-between mb-3">
						<Text className="text-secondary">Shipping</Text>
						<Text className="text-primary font-semibold">
							{subtotal > 0 ? "$2.00" : "$0.00"}
						</Text>
					</View>

					<View className="border-t border-gray-200 pt-4 mt-2 flex-row justify-between">
						<Text className="text-lg font-bold text-primary">Total</Text>
						<Text className="text-lg font-bold text-primary">
							${total.toFixed(2)}
						</Text>
					</View>
				</View>
			</ScrollView>

			{/* Checkout footer */}
			<View className="p-5 border-t border-gray-100 bg-white">
				<TouchableOpacity
					onPress={() => router.push("/checkout")}
					className="bg-primary py-4 rounded-full items-center justify-center flex-row"
				>
					<Text className="text-white font-bold text-base mr-2">
						Proceed to Checkout
					</Text>
					<Ionicons name="arrow-forward" size={20} color="white" />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Cart;

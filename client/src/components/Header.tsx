import { COLORS } from "@/constants";
import { HeaderProps } from "@/constants/types";
import { clearCart, selectCartCount } from "@/redux/features/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";

const Header = ({
	title,
	showBack,
	showSearch,
	showCart,
	showMenu,
	showLogo,
}: HeaderProps) => {
	const router = useRouter();
	const cartcount = useAppSelector(selectCartCount);
	const dispatch = useAppDispatch();
	const handleClearCart = () => {
		Alert.alert(
			"Clear Cart",
			"Are you sure you want to remove all items from your cart?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Clear Cart",
					style: "destructive",
					onPress: () => dispatch(clearCart()),
				},
			],
			{ cancelable: true },
		);
	};
	return (
		<View className="flex-row items-center justify-between px-4 py-3 bg-white">
			{/* Left side */}
			<View className="flex-row items-center flex-1">
				{showBack && (
					<TouchableOpacity onPress={() => router.back()} className="mr-3">
						<Ionicons name="arrow-back" size={24} color={COLORS.primary} />
					</TouchableOpacity>
				)}

				{showMenu && (
					<TouchableOpacity className="mr-3">
						<Ionicons name="menu-outline" size={28} color={COLORS.primary} />
					</TouchableOpacity>
				)}

				{showLogo ? (
					<View className="flex-1">
						<Image
							source={require("@/assets/images/berrylizzy_logo.png")}
							style={{ width: "100%", height: 30 }}
							resizeMode="contain"
						/>
					</View>
				) : (
					title && (
						<Text className="text-xl font-bold text-center flex-1 mr-8">
							{title}
						</Text>
					)
				)}

				{!title && !showSearch && <View className="flex-1" />}
			</View>

			{/* Right side */}
			<View className="flex-row items-center gap-4">
				{showSearch && (
					<TouchableOpacity>
						<Ionicons name="search-outline" size={28} color={COLORS.primary} />
					</TouchableOpacity>
				)}
				{showCart && (
					<TouchableOpacity
						onPress={() =>
							title === "My Cart"
								? handleClearCart()
								: router.push("/(tabs)/cart")
						}
					>
						<View className="relative">
							<View className="items-center">
								<Ionicons
									name={title === "My Cart" ? "trash-outline" : "bag-outline"}
									size={title === "My Cart" ? 24 : 28}
									color={title === "My Cart" ? COLORS.accent : COLORS.primary}
								/>
								{title === "My Cart" && (
									<Text className="text-accent text-xs  ">Clear Cart</Text>
								)}
							</View>
							<View className="absolute -top-1 -right-1 bg-accent w-4 h-4 rounded-full items-center justify-center">
								<Text className="text-white text-[10px] font-bold">
									{cartcount}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default Header;

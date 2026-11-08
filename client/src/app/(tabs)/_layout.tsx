import { COLORS } from "@/constants";
import { selectCartCount } from "@/redux/features/slices/cartSlice";
import { selectWishlistCount } from "@/redux/features/slices/wishlistSlice";
import { useAppSelector } from "@/redux/lib/hooks";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
const Tablayout = () => {
	const cartCount = useAppSelector(selectCartCount);
	const wishlistCount = useAppSelector(selectWishlistCount);
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: COLORS.primary,
				tabBarInactiveTintColor: "#CDCDE0",
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: "#fff",
					borderTopWidth: 1,
					borderTopColor: "#f0f0f0",
					height: 65,
					paddingTop: 5,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "home" : "home-outline"}
							size={26}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="cart"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<View className="relative items-center justify-center">
							<Ionicons
								name={focused ? "cart" : "cart-outline"}
								size={26}
								color={color}
							/>

							{cartCount > 0 && (
								<View
									className="absolute -top-2 -right-3 min-w-[15px] h-[15px] px-1 rounded-full items-center justify-center"
									style={{
										backgroundColor: focused ? COLORS.accent : COLORS.primary,
									}}
								>
									<Text className="text-white text-[9px] font-bold">
										{cartCount}
									</Text>
								</View>
							)}
						</View>
					),
				}}
			/>

			<Tabs.Screen
				name="wishlist"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<View className="relative items-center justify-center">
							<Ionicons
								name={focused ? "heart" : "heart-outline"}
								size={26}
								color={color}
							/>

							{wishlistCount > 0 && (
								<View
									className="absolute -top-2 -right-3 min-w-[15px] h-[15px] px-1 rounded-full items-center justify-center"
									style={{
										backgroundColor: focused ? COLORS.accent : COLORS.primary,
									}}
								>
									<Text className="text-white text-[9px] font-bold">
										{wishlistCount}
									</Text>
								</View>
							)}
						</View>
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "person" : "person-outline"}
							size={26}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
};
export default Tablayout;

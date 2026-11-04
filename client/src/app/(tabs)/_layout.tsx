import { COLORS } from "@/constants";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
const Tablayout = () => {
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
					height: 56,
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
						<Ionicons
							name={focused ? "cart" : "cart-outline"}
							size={26}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="favourites"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "heart" : "heart-outline"}
							size={26}
							color={color}
						/>
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

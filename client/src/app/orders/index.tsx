import { useRouter } from "expo-router";
import {
	FlatList,
	Text,
	TouchableOpacity,
	View,
	ScrollView,
	Image,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS, getStatusColor } from "@/constants";

import { formatDate } from "@/constants/dummyData";
import Ionicons from "@react-native-vector-icons/ionicons";
import Loading from "@/components/Loading";
import {
	useCancelMyOrderMutation,
	useGetMyOrdersQuery,
	useRetryOrderPaymentMutation,
} from "@/redux/features/apis/orderApi";
import Error from "@/components/Error";
import Toast from "react-native-toast-message";
import { canCancelOrder } from "@/redux/lib/canCancelOrder";
import { canRetryPayment } from "@/redux/lib/canRetryPayment";

export default function Orders() {
	const router = useRouter();
	const { data: orders = [], isLoading, isError } = useGetMyOrdersQuery();

	// Update order status
	const [cancelMyOrder, { isLoading: cancelling }] = useCancelMyOrderMutation();
	const [retryPayment, { isLoading: retrying }] =
		useRetryOrderPaymentMutation();

	const handleRetryPayment = async (orderId: string) => {
		// Implement the logic to retry the payment here
		try {
			await retryPayment(orderId).unwrap();
			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Payment retry successfully.",
			});
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Payment Retry Failed",
				text2: error?.data || "Failed to retry payment.",
			});
		}
	};
	const handleCancelOrder = async (orderId: string) => {
		// Implement the logic to cancel the order here
		try {
			await cancelMyOrder(orderId).unwrap();
			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Order cancelled successfully.",
			});
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Order Cancellation Failed",
				text2: error?.data || "Failed to cancel order.",
			});
		}
	};

	if (isError) return <Error message="Unable to load your orders" />;
	if (isLoading) return <Loading />;
	return (
		<SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
			<Header title="My Orders" showBack />
			<View>
				<Text className="text-primary font-medium  px-4 py-2">
					{orders.length} orders
				</Text>
			</View>
			{orders?.length === 0 ? (
				<View className="flex-1 justify-center items-center">
					<Text className="text-secondary text-lg">No orders found</Text>
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(item) => item._id}
					contentContainerStyle={{ padding: 16 }}
					renderItem={({ item, index }) => (
						<View className="bg-white p-4 rounded-xl  border mb-4 border-gray-100 shadow-sm">
							<TouchableOpacity
								className="bg-white"
								onPress={() => router.push(`/orders/${item._id}`)}
							>
								<View className="flex-row justify-between mb-2">
									<Text className="text-primary font-bold">
										Order #{item.orderNumber}
									</Text>
									<Text className="text-secondary text-sm">
										{formatDate(item.createdAt)}
									</Text>
								</View>

								{/* Status Badges */}
								<View className="flex-row gap-2 mb-3">
									<View
										className={`px-2 py-1 rounded-full ${getStatusColor(item.orderStatus)}`}
									>
										<Text className={`text-xs font-bold capitalize`}>
											{item.orderStatus}
										</Text>
									</View>

									<View
										className={`px-2 py-1 rounded-full ${
											item.paymentStatus === "paid"
												? "bg-green-100"
												: "bg-gray-100"
										}`}
									>
										<Text
											className={`text-xs font-bold capitalize ${
												item.paymentStatus === "paid"
													? "text-green-700"
													: "text-gray-700"
											}`}
										>
											{item.paymentStatus}
										</Text>
									</View>
								</View>

								<View className="flex-row justify-between items-center mb-2">
									<Text className="text-secondary text-xs">
										Payment Method:
										<Text className="text-primary font-medium capitalize">
											{item.paymentMethod}
										</Text>
									</Text>
								</View>

								{/* Product Images */}
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									className="mb-3"
								>
									{item.orderItems.map((item: any, index) => {
										const image = item.productId?.images?.[0];
										return (
											<View
												key={index}
												className="mr-3 border border-gray-100 rounded-md p-1 bg-gray-50"
											>
												{image ? (
													<Image
														source={{ uri: image }}
														className="w-12 h-12 rounded-md"
														resizeMode="cover"
													/>
												) : (
													<View className="w-12 h-12 bg-gray-200 rounded-md justify-center items-center">
														<Ionicons
															name="image-outline"
															size={20}
															color={COLORS.secondary}
														/>
													</View>
												)}
											</View>
										);
									})}
								</ScrollView>

								<View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
									<Text className="text-secondary">
										Items: {item.orderItems.length}
									</Text>
									<Text className="text-primary font-bold text-lg">
										${item.totalAmount.toFixed(2)}
									</Text>
								</View>
							</TouchableOpacity>

							{canRetryPayment(item) && (
								<TouchableOpacity
									className="border border-red-300 bg-red-100 justify-center items-center py-3 mt-3 rounded-full"
									disabled={retrying}
									onPress={() => handleRetryPayment(item._id)}
								>
									<Text className="text-red-500 font-bold">
										{retrying ? <ActivityIndicator /> : "Retry Payment"}
									</Text>
								</TouchableOpacity>
							)}
							{canCancelOrder(item) && (
								<TouchableOpacity
									className="border border-red-300 bg-red-100 justify-center items-center py-3 mt-3 rounded-full"
									disabled={cancelling}
									onPress={() => handleCancelOrder(item._id)}
								>
									<Text className="text-red-500 font-bold">
										{cancelling ? (
											<ActivityIndicator />
										) : item.paymentStatus === "paid" ? (
											"Cancel order & request refund"
										) : (
											"Cancel order"
										)}
									</Text>
								</TouchableOpacity>
							)}
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

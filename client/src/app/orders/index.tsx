import { useFocusEffect, useRouter } from "expo-router";
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
import {
	COLORS,
	formatRefundStatus,
	getRefundStatuscColor,
	getStatusColor,
} from "@/constants";
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
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import formatDate from "@/redux/lib/formatDate";

export default function Orders() {
	const [pendingRetryOrderId, setPendingRetryOrderId] = useState<string | null>(
		null,
	);
	const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
	const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
		null,
	);
	const router = useRouter();
	const {
		data: orders = [],
		isLoading,
		isError,
		refetch,
	} = useGetMyOrdersQuery();

	// Update order status
	const [cancelMyOrder] = useCancelMyOrderMutation();
	const [retryOrderPayment] = useRetryOrderPaymentMutation();

	const handleRetryPayment = async (orderId: string) => {
		setRetryingOrderId(orderId);
		// Implement the logic to retry the payment here
		try {
			const retryPayment = await retryOrderPayment(orderId).unwrap();
			setPendingRetryOrderId(orderId);
			await WebBrowser.openBrowserAsync(retryPayment.authorization_url);

			await refetch();
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Payment Retry Failed",
				text2: error?.data || "Failed to retry payment.",
			});
			setRetryingOrderId(null);
			setPendingRetryOrderId(null);
			await refetch();
		} finally {
			await refetch();

			setRetryingOrderId(null);
			setPendingRetryOrderId(null);
		}
	};
	const handleCancelOrder = async (orderId: string) => {
		setCancellingOrderId(orderId);
		// Implement the logic to cancel the order here
		try {
			const response = await cancelMyOrder(orderId).unwrap();
			Toast.show({
				type: "success",
				text1: "Success",
				text2: response || "Order cancelled successfully.",
			});
			await refetch();
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Order Cancellation Failed",
				text2: error?.data || "Failed to cancel order.",
			});
			await refetch();

			setCancellingOrderId(null);
		} finally {
			await refetch();

			setCancellingOrderId(null);
		}
	};

	useEffect(() => {
		if (!pendingRetryOrderId) return;

		const retriedOrder = orders.find(
			(order) => order._id === pendingRetryOrderId,
		);

		if (retriedOrder?.paymentStatus !== "paid") {
			return;
		}

		setPendingRetryOrderId(null);

		Toast.show({
			type: "success",
			text1: "Payment retry success",
			text2: `Payment for order #${retriedOrder.orderNumber} was confirmed.`,
		});
		refetch();
	}, [pendingRetryOrderId, orders]);

	useFocusEffect(
		useCallback(() => {
			void refetch();
		}, [refetch]),
	);

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
									<Text className="text-secondary text-xs">
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
								{item.paymentMethod === "paystack" &&
									item.orderStatus === "cancelled" &&
									item.refundStatus !== "not_requested" && (
										<View className="flex-row items-center mb-2">
											<Text className="text-secondary text-xs">
												Refund Status:
											</Text>
											<View
												className={`rounded-full px-2 ${getRefundStatuscColor(item.refundStatus)}`}
											>
												<Text className="font-medium text-xs capitalize">
													{formatRefundStatus(item.refundStatus)}
												</Text>
											</View>
										</View>
									)}
								<View className="flex-row items-center mb-2">
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
									disabled={item._id === retryingOrderId}
									onPress={() => handleRetryPayment(item._id)}
								>
									<Text className="text-red-500 font-bold">
										{item._id === retryingOrderId ? (
											<ActivityIndicator />
										) : (
											"Retry Payment"
										)}
									</Text>
								</TouchableOpacity>
							)}
							{canCancelOrder(item) && (
								<TouchableOpacity
									className="border border-red-300 bg-red-100 justify-center items-center py-3 mt-3 rounded-full"
									disabled={item._id === cancellingOrderId}
									onPress={() => handleCancelOrder(item._id)}
								>
									<Text className="text-red-500 font-bold">
										{item._id === cancellingOrderId ? (
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

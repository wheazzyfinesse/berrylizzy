import { useState } from "react";
import {
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	ActivityIndicator,
	RefreshControl,
	Alert,
	Modal,
	TouchableWithoutFeedback,
	FlatList,
} from "react-native";

import { COLORS, getStatusColor } from "@/constants";
import type { Order, OrderStatus } from "@/constants/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import Loading from "@/components/Loading";

import {
	useGetOrdersQuery,
	useUpdateOrderStatusMutation,
} from "@/redux/features/apis/orderApi";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

const STATUSES: OrderStatus[] = [
	"placed",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
];

export default function AdminOrders() {
	const router = useRouter();
	// Fetch orders
	const { data: orders = [], isLoading, refetch } = useGetOrdersQuery();

	// Update order status
	const [updateOrderStatus, { isLoading: updating }] =
		useUpdateOrderStatusMutation();

	// Local state
	const [refreshing, setRefreshing] = useState(false);
	const [statusModalVisible, setStatusModalVisible] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	// Refresh orders
	const onRefresh = async () => {
		setRefreshing(true);

		try {
			await refetch().unwrap();
		} catch {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Unable to refresh orders.",
			});
		} finally {
			setRefreshing(false);
		}
	};

	// Open status modal
	const openStatusModal = (order: Order) => {
		setSelectedOrder(order);
		setStatusModalVisible(true);
	};

	// Close status modal
	const closeStatusModal = () => {
		if (updating) return;

		setStatusModalVisible(false);
		setSelectedOrder(null);
	};

	// Update order status
	const updateStatus = async (newStatus: OrderStatus) => {
		if (!selectedOrder || updating) return;

		if (selectedOrder.orderStatus === newStatus) {
			closeStatusModal();
			return;
		}

		try {
			await updateOrderStatus({
				id: selectedOrder._id,
				orderStatus: newStatus,
			}).unwrap();

			setStatusModalVisible(false);
			setSelectedOrder(null);

			Toast.show({
				type: "Success",
				text1: "Order status updated successfully.",
			});
		} catch {
			Toast.show({
				type: "error",
				text1: "Update failed",
				text2: "Unable to update order status. Please try again.",
			});
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<View className="flex-1 bg-surface">
			<ScrollView
				className="flex-1 p-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{orders.length === 0 ? (
					<View className="flex-1 justify-center items-center mt-20">
						<Text className="text-secondary">No orders found</Text>
					</View>
				) : (
					orders.map((order) => {
						const customer = typeof order.user === "object" ? order.user : null;

						return (
							<TouchableOpacity
								key={order._id}
								onPress={() => router.push(`/orders/${order._id}`)}
							>
								<View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
									{/* Order header */}
									<View className="flex-row justify-between mb-2">
										<Text className="font-medium text-sm text-gray-400">
											Order ID: #{order._id}
										</Text>

										<Text className="text-secondary text-xs">
											{new Date(order.createdAt).toLocaleDateString()}
										</Text>
									</View>

									{/* Customer */}
									<View className="mb-3 bg-gray-50 p-3 rounded-lg">
										{/* <Text className="text-xs text-secondary font-bold mb-1">
                    CUSTOMER
                  </Text>

                  <Text className="text-primary font-medium">
                    {customer?.name || "Unknown User"}
                  </Text>

                  <Text className="text-secondary text-xs">
                    {customer?.email || "No email"}
                  </Text> */}

										{!customer && (
											<Text className="text-xs text-gray-400 mt-1">
												ID:{" "}
												{typeof order.user === "string" ? order.user : "N/A"}
											</Text>
										)}
									</View>

									{/* Shipping address */}
									<View className="mb-3 bg-gray-50 p-3 rounded-lg">
										<Text className="text-xs text-secondary font-bold mb-1">
											SHIPPING ADDRESS
										</Text>

										<Text className="text-primary text-xs">
											{order.shippingAddress.street},{" "}
											{order.shippingAddress.city}
										</Text>

										<Text className="text-primary text-xs">
											{order.shippingAddress.state},{" "}
											{order.shippingAddress.zipCode},{" "}
											{order.shippingAddress.country}
										</Text>
									</View>

									{/* Order items */}
									<View className="mb-3">
										<Text className="text-xs text-secondary font-bold mb-2">
											ITEMS
										</Text>

										{order.items.map((item) => {
											const productName =
												typeof item.product === "object"
													? item.product.name
													: item.name;

											return (
												<View
													key={item._id}
													className="flex-row justify-between mb-1"
												>
													<Text className="text-secondary text-xs flex-1">
														{item.quantity}x {productName}
														{item.size && (
															<Text className="text-gray-400">
																{" "}
																({item.size})
															</Text>
														)}
													</Text>

													<Text className="text-secondary text-xs font-bold">
														${item.price.toFixed(2)}
													</Text>
												</View>
											);
										})}
									</View>

									{/* Order total and status */}
									<View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
										<Text className="text-primary font-bold text-lg">
											${order.totalAmount.toFixed(2)}
										</Text>

										<TouchableOpacity
											onPress={() => openStatusModal(order)}
											className={`flex-row items-center px-4 py-2 rounded-full ${getStatusColor(
												order.orderStatus,
											)}`}
										>
											<Text className="text-xs font-bold mr-2 uppercase tracking-wide">
												{order.orderStatus}
											</Text>

											<Ionicons
												name="pencil"
												size={12}
												color="black"
												style={{ opacity: 0.5 }}
											/>
										</TouchableOpacity>
									</View>
								</View>
							</TouchableOpacity>
						);
					})
				)}
			</ScrollView>

			{/* Status update modal */}
			<Modal
				visible={statusModalVisible}
				animationType="fade"
				transparent
				onRequestClose={closeStatusModal}
			>
				<TouchableWithoutFeedback onPress={closeStatusModal}>
					<View className="flex-1 justify-end bg-black/50">
						<TouchableWithoutFeedback>
							<View className="bg-white rounded-t-2xl p-4 max-h-[60%]">
								{/* Modal header */}
								<View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
									<Text className="text-lg font-bold text-primary">
										Update Order Status
									</Text>

									<TouchableOpacity
										onPress={closeStatusModal}
										disabled={updating}
									>
										<Ionicons name="close" size={24} color={COLORS.secondary} />
									</TouchableOpacity>
								</View>

								{/* Updating indicator */}
								{updating ? (
									<View className="py-8">
										<ActivityIndicator size="large" color={COLORS.primary} />

										<Text className="text-center text-secondary mt-2">
											Updating status...
										</Text>
									</View>
								) : (
									<FlatList
										data={STATUSES}
										keyExtractor={(item) => item}
										renderItem={({ item }) => {
											const isSelected = selectedOrder?.orderStatus === item;

											return (
												<TouchableOpacity
													className={`p-4 rounded-xl mb-2 flex-row justify-between items-center ${
														isSelected ? "bg-primary/10" : "bg-gray-50"
													}`}
													onPress={() => updateStatus(item)}
												>
													<Text
														className={`font-medium capitalize ${
															isSelected
																? "text-primary font-bold"
																: "text-secondary"
														}`}
													>
														{item}
													</Text>

													{isSelected && (
														<Ionicons
															name="checkmark-circle"
															size={20}
															color={COLORS.primary}
														/>
													)}
												</TouchableOpacity>
											);
										}}
									/>
								)}
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
}

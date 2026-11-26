import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	ActivityIndicator,
	RefreshControl,
	Image,
	Alert,
} from "react-native";
import { COLORS } from "@/constants";
import { dummyProducts } from "@/constants/dummyData";
import Ionicons from "@react-native-vector-icons/ionicons";
import Loading from "@/components/Loading";
import {
	useDeleteProductMutation,
	useGetProductsQuery,
} from "@/redux/features/apis/productApi";
import { ID } from "@/constants/types";
import Toast from "react-native-toast-message";

export default function AdminProducts() {
	const router = useRouter();
	const { data, isLoading, error, refetch } = useGetProductsQuery();
	const [deleteProduct] = useDeleteProductMutation();
	const products = data?.products;
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = () => {
		setRefreshing(true);
		refetch();
	};
	const handleDelete = (id: ID) => {
		Alert.alert("Delete product?", "This product will be removed.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteProduct(id).unwrap();
						Toast.show({
							type: "success",
							text1: "success",
							text2: "Product deleted successfully!",
						});
					} catch (error: any) {
						Toast.show({
							type: "error",
							text1: "Could not delete product",
							text2: error?.data?.message ?? "Please try again.",
						});
					}
				},
			},
		]);
	};

	if (isLoading && !refreshing) {
		return <Loading />;
	}

	return (
		<View className="flex-1 bg-surface">
			<View className="p-4 bg-white border border-gray-100 flex-row justify-between items-center">
				<Text className="text-lg font-semibold text-primary">
					Total Products ({products?.length})
				</Text>
				<TouchableOpacity
					onPress={() => router.push("/admin/products/add")}
					className="bg-gray-800 px-4 py-2 rounded-full flex-row items-center"
				>
					<Ionicons name="add" size={20} color="white" />
					<Text className="text-white font-medium ml-1">Add Product</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1 p-2"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{products?.length === 0 ? (
					<View className="flex-1 justify-center items-center mt-20">
						<Text className="text-secondary">No products found</Text>
					</View>
				) : (
					products?.map((product: any) => (
						<View
							key={product._id}
							className="bg-white p-3 rounded-lg border border-gray-100 mb-3 flex-row items-center"
						>
							<Image
								source={{
									uri:
										product.images && product.images.length > 0
											? product.images[0]
											: "https://via.placeholder.com/150",
								}}
								className="w-16 h-16 rounded-lg bg-gray-100 mr-3"
								resizeMode="cover"
							/>

							<View className="flex-1">
								<Text
									className="font-bold text-primary text-base"
									numberOfLines={1}
								>
									{product.name}
								</Text>
								<Text className="text-secondary text-xs mb-1" numberOfLines={1}>
									Category : {product.category || "Others"}
								</Text>
								<Text className="text-secondary text-xs mb-1" numberOfLines={1}>
									Stock : {product.stock}
								</Text>
								<Text className="text-secondary text-xs mb-1" numberOfLines={1}>
									Sizes : {product.sizes.join(", ")}
								</Text>
								<Text className="text-primary font-bold">
									${product.price.toFixed(2)}
								</Text>
							</View>

							<View className="flex-row items-center">
								<TouchableOpacity
									onPress={() => router.push(`/admin/products/${product._id}`)}
									className="p-2 bg-slate-50 rounded-full mr-2"
								>
									<Ionicons name="create-outline" size={18} color="#333333" />
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => handleDelete(product._id)}
									className="p-2 bg-gray-50 rounded-full"
								>
									<Ionicons name="trash-outline" size={18} color="#333333" />
								</TouchableOpacity>
							</View>
						</View>
					))
				)}
			</ScrollView>
		</View>
	);
}

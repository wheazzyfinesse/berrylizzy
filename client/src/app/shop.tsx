import { useEffect, useState } from "react";
import {
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { useGetProductsQuery } from "@/redux/features/apis/productApi";
import Loading from "@/components/Loading";
import Error from "@/components/Error";
import { Product } from "@/constants/types";
import ProductCard from "@/components/ProductCard";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "@/constants";

const PAGE_SIZE = 10;

const Shop = () => {
	const [page, setPage] = useState(1);
	const [products, setProducts] = useState<Product[]>([]);
	const [hasMore, setHasMore] = useState(true);

	const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(
		{
			page,
			limit: 10,
		},
	);

	useEffect(() => {
		if (!data) return;

		if (page === 1) {
			setProducts(data);
		} else {
			setProducts((previous) => {
				const existingIds = new Set(previous.map((p) => p._id));

				return [...previous, ...data.filter((p) => !existingIds.has(p._id))];
			});
		}

		setHasMore(data.length === 10);
	}, [data, page]);

	const loadMore = () => {
		if (!isFetching && hasMore) {
			setPage((previous) => previous + 1);
		}
	};

	if (isError && products.length === 0) {
		return <Error onRetry={refetch} />;
	}

	return (
		<SafeAreaView>
			{/* Header */}
			<Header title="Shop" showBack showCart />
			<View className=" flex-row gap-2 mx-4 my-2">
				{/* SearchBar */}
				<View className="flex-1 flex-row items-center bg-white rounded-xl border border-gray-100">
					<Ionicons
						style={{ marginLeft: 8 }}
						name="search"
						size={20}
						color={COLORS.secondary}
					/>
					<TextInput
						className="flex-1 text-primary ml-2  py-3"
						placeholder="Search products..."
						returnKeyType="search"
					/>
				</View>

				{/* Filter Icon */}
				<TouchableOpacity className="bg-gray-800 w-12 h-12 items-center justify-center rounded-xl">
					<Ionicons name="options-outline" size={24} color="white" />
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<Loading />
			) : (
				<FlatList
					data={products}
					keyExtractor={(item) => item._id}
					numColumns={2}
					columnWrapperStyle={{
						justifyContent: "space-between",
					}}
					contentContainerStyle={{
						padding: 16,
						paddingBottom: 100,
					}}
					renderItem={({ item }) => <ProductCard product={item} />}
					onEndReached={loadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={isFetching ? <Loading /> : undefined}
					ListEmptyComponent={
						<Text className="text-center mt-10 text-secondary">
							No products found.
						</Text>
					}

					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
};

export default Shop;

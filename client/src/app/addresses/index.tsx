import React, { useState } from "react";
import {
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	Modal,
	TextInput,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Address, AddressType } from "@/constants/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import Toast from "react-native-toast-message";
import {
	useAddAddressMutation,
	useDeleteAddressMutation,
	useGetAddressesQuery,
	useSetDefaultAddressMutation,
	useUpdateAddressMutation,
} from "@/redux/features/apis/addressApi";

export default function Addresses() {
	const addressTypes: AddressType[] = ["Home", "Work", "Other"];
	const { data: addresses, isLoading: addressLoading } = useGetAddressesQuery();

	const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
	const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
	const [setDefaultAddress] = useSetDefaultAddressMutation();
	const [deleteAddress] = useDeleteAddressMutation();

	const submitting = isAdding || isUpdating;

	// Form state
	const [type, setType] = useState<AddressType>("Home");
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [country, setCountry] = useState("");
	const [phone, setPhone] = useState("");
	const [isDefault, setIsDefault] = useState(false);

	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);

	const handleEditSearch = (item: Address) => {
		setIsEditing(true);
		setEditingId(item._id);
		setType(item.type);
		setStreet(item.street);
		setCity(item.city);
		setState(item.state);
		setZipCode(item.zipCode);
		setCountry(item.country);
		setPhone(item.phone);
		setIsDefault(item.isDefault);
		setModalVisible(true);
	};

	const resetForm = () => {
		setType("Home");
		setStreet("");
		setCity("");
		setState("");
		setZipCode("");
		setCountry("");
		setPhone("");
		setIsDefault(false);
		setIsEditing(false);
		setEditingId(null);
	};

	const handleSaveAddress = async () => {
		const data = {
			type,
			street: street.trim(),
			city: city.trim(),
			state: state.trim(),
			zipCode: zipCode.trim(),
			country: country.trim(),
			phone: phone.trim(),
			isDefault,
		};

		if (
			!data.street ||
			!data.city ||
			!data.state ||
			!data.zipCode ||
			!data.country ||
			!data.phone
		) {
			Toast.show({
				type: "info",
				text1: "Missing information",
				text2: "Complete all address fields.",
			});
			return;
		}

		try {
			if (isEditing && editingId) {
				await updateAddress({ id: editingId, data }).unwrap();
				Toast.show({
					type: "success",
					text1: "success",
					text2: "Address updated successfully!",
				});
			} else {
				await addAddress(data).unwrap();
				Toast.show({
					type: "success",
					text1: "success",
					text2: "Address added successfully!",
				});
			}

			setModalVisible(false);
			resetForm();
		} catch (error: any) {
			console.log(error);
			Toast.show({
				type: "error",
				text1: "Could not save address",
				text2: error?.data?.message ?? "Please try again.",
			});
		}
	};

	const handleSetDefaultAddress = async (id: string) => {
		try {
			await setDefaultAddress(id).unwrap();
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Could not update default address",
				text2: error?.data?.message ?? "Please try again.",
			});
		}
	};

	const handleDeleteAddress = (id: string) => {
		Alert.alert("Delete address?", "This address will be removed.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteAddress(id).unwrap();
						Toast.show({
							type: "success",
							text1: "success",
							text2: "Address deleted successfully!",
						});
					} catch (error: any) {
						Toast.show({
							type: "error",
							text1: "Could not delete address",
							text2: error?.data?.message ?? "Please try again.",
						});
					}
				},
			},
		]);
	};

	const openAddModal = () => {
		resetForm();
		setModalVisible(true);
	};

	return (
		<SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
			<Header title="Shipping Addresses" showBack />

			{addressLoading ? (
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={COLORS.primary} />
				</View>
			) : (
				<ScrollView className="flex-1 px-4 pt-4">
					{addresses?.length === 0 ? (
						<Text className="text-center text-secondary mt-10">
							No addresses found
						</Text>
					) : (
						addresses?.map((item) => (
							<View
								key={item._id}
								className="bg-white p-4 rounded-xl mb-4 shadow-sm"
							>
								<View className="flex-row items-center justify-between mb-2">
									<View className="flex-row items-center">
										<Ionicons
											name={
												item.type === "Home"
													? "home-outline"
													: "briefcase-outline"
											}
											size={20}
											color={COLORS.primary}
										/>
										<Text className="text-base font-bold text-primary ml-2">
											{item.type}
										</Text>
										{item.isDefault && (
											<View className="bg-primary/10 px-2 py-1 rounded ml-2">
												<Text className="text-primary text-xs font-bold">
													Default
												</Text>
											</View>
										)}
									</View>
									<View className="flex-row items-center gap-4">
										<TouchableOpacity onPress={() => handleEditSearch(item)}>
											<Ionicons
												name="pencil-outline"
												size={20}
												color={COLORS.secondary}
											/>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => handleDeleteAddress(item._id)}
										>
											<Ionicons
												name="trash-outline"
												size={20}
												color={COLORS.error || "#ff4444"}
											/>
										</TouchableOpacity>
									</View>
								</View>
								<Text className="text-secondary leading-5 ml-7">
									{item.street}, {item.city}, {item.state} {item.zipCode},{" "}
									{item.country}
								</Text>
							</View>
						))
					)}

					<TouchableOpacity
						className="flex-row items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl mt-2 mb-8"
						onPress={openAddModal}
					>
						<Ionicons name="add" size={24} color={COLORS.secondary} />
						<Text className="text-secondary font-medium ml-2">
							Add New Address
						</Text>
					</TouchableOpacity>
				</ScrollView>
			)}

			{/* Add Address Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={0}
				>
					<View className="flex-1 justify-end bg-black/50">
						<View className="bg-white rounded-t-3xl p-6 h-[85%]">
							<View className="flex-row justify-between items-center mb-6">
								<Text className="text-xl font-bold text-primary">
									{isEditing ? "Edit Address" : "Add New Address"}
								</Text>
								<TouchableOpacity onPress={() => setModalVisible(false)}>
									<Ionicons name="close" size={24} color={COLORS.primary} />
								</TouchableOpacity>
							</View>

							<ScrollView showsVerticalScrollIndicator={false}>
								<Text className="text-primary font-medium mb-2">Label</Text>
								<View className="flex-row gap-3 mb-4">
									{addressTypes.map((t) => (
										<TouchableOpacity
											key={t}
											onPress={() => setType(t)}
											className={`px-4 py-2 rounded-full border ${type === t ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
										>
											<Text
												className={type === t ? "text-white" : "text-primary"}
											>
												{t}
											</Text>
										</TouchableOpacity>
									))}
								</View>

								<Text className="text-primary font-medium mb-2">
									Street Address
								</Text>
								<TextInput
									className="bg-surface p-4 rounded-xl text-primary mb-4"
									placeholder="123 Main St"
									value={street}
									onChangeText={setStreet}
								/>
								<Text className="text-primary font-medium mb-2">Phone</Text>
								<TextInput
									className="bg-surface p-4 rounded-xl text-primary mb-4"
									placeholder="+123 456 789 "
									value={phone}
									onChangeText={setPhone}
								/>

								<View className="flex-row gap-4 mb-4">
									<View className="flex-1">
										<Text className="text-primary font-medium mb-2">City</Text>
										<TextInput
											className="bg-surface p-4 rounded-xl text-primary"
											placeholder="New York"
											value={city}
											onChangeText={setCity}
										/>
									</View>
									<View className="flex-1">
										<Text className="text-primary font-medium mb-2">State</Text>
										<TextInput
											className="bg-surface p-4 rounded-xl text-primary"
											placeholder="NY"
											value={state}
											onChangeText={setState}
										/>
									</View>
								</View>

								<View className="flex-row gap-4 mb-4">
									<View className="flex-1">
										<Text className="text-primary font-medium mb-2">
											Zip Code
										</Text>
										<TextInput
											className="bg-surface p-4 rounded-xl text-primary"
											placeholder="10001"
											value={zipCode}
											onChangeText={setZipCode}
											keyboardType="numeric"
										/>
									</View>
									<View className="flex-1">
										<Text className="text-primary font-medium mb-2">
											Country
										</Text>
										<TextInput
											className="bg-surface p-4 rounded-xl text-primary"
											placeholder="USA"
											value={country}
											onChangeText={setCountry}
										/>
									</View>
								</View>

								<TouchableOpacity
									className="flex-row items-center mb-8"
									onPress={() => setIsDefault(!isDefault)}
								>
									<View
										className={`w-5 h-5 border rounded mr-2 items-center justify-center ${isDefault ? "bg-primary border-primary" : "border-gray-300"}`}
									>
										{isDefault && (
											<Ionicons name="checkmark" size={14} color="white" />
										)}
									</View>
									<Text className="text-primary">Set as default address</Text>
								</TouchableOpacity>

								<TouchableOpacity
									className="w-full bg-primary py-4 rounded-full items-center mb-10"
									onPress={handleSaveAddress}
									disabled={submitting}
								>
									{submitting ? (
										<ActivityIndicator color="white" />
									) : (
										<Text className="text-white font-bold text-lg">
											Save Address
										</Text>
									)}
								</TouchableOpacity>
							</ScrollView>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}

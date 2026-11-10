import { useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";

import Header from "@/components/Header";
import Loading from "@/components/Loading";

import {
	selectCheckout,
	setStep,
	nextStep,
	prevStep,
	setSelectedAddress,
	setPaymentMethod,
	setNotes,
	setPlacingOrder,
	resetCheckout,
} from "@/redux/features/slices/checkoutSlice";

import {
	selectCartItems,
	selectCartSubtotal,
	clearCart,
	selectCartCount,
} from "@/redux/features/slices/cartSlice";

import { useGetAddressesQuery } from "@/redux/features/apis/addressApi";

import { useCreateOrderMutation } from "@/redux/features/apis/orderApi";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { COLORS } from "@/constants";
import { CHECKOUT_STEPS, CheckoutStep, paymentMethod } from "@/constants/types";

const SHIPPING_COST = 2;
const TAX = 0;

const Checkout = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const checkout = useAppSelector(selectCheckout);
	const cartItems = useAppSelector(selectCartItems);
	const subtotal = useAppSelector(selectCartSubtotal);
	const cartQuantity = useAppSelector(selectCartCount);

	const shipping = cartItems.length > 0 ? SHIPPING_COST : 0;
	const total = subtotal + shipping + TAX;

	const {
		data: addresses = [],
		isLoading: addressesLoading,
		isError: addressesError,
	} = useGetAddressesQuery();

	const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();

	const selectedAddress = addresses.find(
		(address) => address._id === checkout.selectedAddressId,
	);

	// Select the default address when addresses are loaded.
	useEffect(() => {
		if (addresses.length === 0 || checkout.selectedAddressId) return;

		const defaultAddress =
			addresses.find((address) => address.isDefault) || addresses[0];

		dispatch(setSelectedAddress(defaultAddress._id));
	}, [addresses, checkout.selectedAddressId, dispatch]);

	const handleNext = () => {
		if (checkout.step === 1 && !checkout.selectedAddressId) {
			Alert.alert("Select an address", "Please select a delivery address.");
			return;
		}

		if (checkout.step === 3) {
			handlePlaceOrder();
			return;
		}

		dispatch(nextStep());
	};

	const handlePlaceOrder = async () => {
		if (!selectedAddress) {
			Alert.alert("Address required", "Please select a delivery address.");
			dispatch(setStep(1));
			return;
		}

		if (cartItems.length === 0) {
			Alert.alert("Empty cart", "Your cart is empty.");
			router.back();
			return;
		}

		// Stripe requires a payment-intent and payment confirmation flow.
		// Do not create a paid Stripe order until that integration is complete.
		if (checkout.paymentMethod === "stripe") {
			Alert.alert(
				"Stripe payment",
				"Stripe payment processing has not yet been connected.",
			);
			return;
		}

		try {
			dispatch(setPlacingOrder(true));

			const orderPayload = {
				items: cartItems.map((item) => ({
					productId: item.product._id,
					name: item.product.name,
					price: item.product.price,
					image: item.product.images,
					size: item.size,
					quantity: item.quantity,
				})),
				addressId: selectedAddress._id,
				shippingAddress: selectedAddress,
				paymentMethod: checkout.paymentMethod,
				notes: checkout.notes,
				subtotal,
				shipping,
				tax: TAX,
				total,
			};

			await createOrder(orderPayload).unwrap();

			dispatch(clearCart());
			dispatch(resetCheckout());

			Alert.alert("Order placed", "Your order has been placed successfully.", [
				{
					text: "Continue shopping",
					onPress: () => router.replace("/(tabs)"),
				},
			]);
		} catch (error: any) {
			Alert.alert(
				"Order failed",
				error?.data?.message || "Unable to place your order. Please try again.",
			);
		} finally {
			dispatch(setPlacingOrder(false));
		}
	};

	if (addressesLoading) {
		return (
			<SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
				<Header title="Checkout" />
				<Loading />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
			<Header title="Checkout" showBack />

			{/* Progress indicator */}
			<View className="flex-row items-center justify-between px-5 py-5">
				{CHECKOUT_STEPS.map((item) => (
					<TouchableOpacity
						key={item.step}
						onPress={() => {
							if (item.step < checkout.step) {
								dispatch(setStep(item.step as CheckoutStep));
							}
						}}
						className="items-center flex-1"
					>
						<View
							className="w-9 h-9 rounded-full items-center justify-center"
							style={{
								backgroundColor:
									checkout.step >= item.step
										? COLORS.primary
										: COLORS.secondary,
							}}
						>
							<Text className="text-white font-bold">{item.step}</Text>
						</View>

						<Text
							className="text-xs mt-2 font-semibold"
							style={{
								color:
									checkout.step >= item.step
										? COLORS.primary
										: COLORS.secondary,
							}}
						>
							{item.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<ScrollView
				className="flex-1 px-4"
				contentContainerStyle={{ paddingBottom: 30 }}
				showsVerticalScrollIndicator={false}
			>
				{/* STEP 1: ADDRESS */}
				{checkout.step === 1 && (
					<View>
						<Text className="text-xl font-bold text-primary mb-2">
							Delivery Address
						</Text>

						<Text className="text-secondary mb-5">
							Select where you want your order delivered.
						</Text>

						{addressesError ? (
							<View className="bg-white rounded-xl p-5">
								<Text className="text-red-500">
									Unable to load your addresses. Please try again.
								</Text>
							</View>
						) : addresses.length === 0 ? (
							<View className="bg-white rounded-xl p-5 items-center">
								<Ionicons
									name="location-outline"
									size={35}
									color={COLORS.secondary}
								/>

								<Text className="font-bold text-primary mt-3">
									No saved addresses
								</Text>

								<Text className="text-secondary text-center mt-2 mb-4">
									Add a delivery address before continuing.
								</Text>

								<TouchableOpacity
									onPress={() => router.push("/addresses")}
									className="bg-primary rounded-full px-6 py-3"
								>
									<Text className="text-white font-bold">Add Address</Text>
								</TouchableOpacity>
							</View>
						) : (
							<>
								{addresses.map((address) => {
									const selected = checkout.selectedAddressId === address._id;

									return (
										<TouchableOpacity
											key={address._id}
											onPress={() => dispatch(setSelectedAddress(address._id))}
											className="bg-white rounded-xl p-4 mb-3 border-2"
											style={{
												borderColor: selected ? COLORS.primary : "#E5E7EB",
											}}
										>
											<View className="flex-row items-center justify-between">
												<View className="flex-row items-center flex-1">
													<Ionicons
														name="location-outline"
														size={22}
														color={COLORS.accent}
													/>

													<Text className="font-bold text-primary ml-2">
														{address.name}
													</Text>

													{address.isDefault && (
														<Text className="text-xs text-accent ml-2">
															Default
														</Text>
													)}
												</View>

												<Ionicons
													name={
														selected ? "radio-button-on" : "radio-button-off"
													}
													size={22}
													color={selected ? COLORS.accent : COLORS.secondary}
												/>
											</View>

											<Text className="text-secondary mt-3">
												{address.street}
											</Text>

											<Text className="text-secondary">
												{address.city}, {address.zipCode}
											</Text>

											<Text className="text-secondary">{address.phone}</Text>
										</TouchableOpacity>
									);
								})}

								<TouchableOpacity
									onPress={() => router.push("/addresses")}
									className="flex-row items-center justify-center py-4"
								>
									<Ionicons
										name="add-circle-outline"
										size={20}
										color={COLORS.accent}
									/>
									<Text className="text-accent font-bold ml-2">
										Add another address
									</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				)}

				{/* STEP 2: PAYMENT */}
				{checkout.step === 2 && (
					<View>
						<View className="bg-white mb-2 rounded-lg p-2">
							{/* Selected Address */}
							<Text className="text-xl font-bold text-primary mb-2">
								Selected Delivery Address
							</Text>
							<Text className="text-secondary font-bold mb-2">
								Name:
								<Text className="font-light"> {selectedAddress?.name}</Text>
							</Text>
							<Text className="text-secondary font-bold  mb-2">
								Phone:
								<Text className="font-light"> {selectedAddress?.phone}</Text>
							</Text>
							<Text className="text-secondary font-bold  mb-2">
								Type:
								<Text className="font-light"> {selectedAddress?.type}</Text>
							</Text>
							<Text className="text-secondary font-bold  mb-2">
								Street:
								<Text className="font-light"> {selectedAddress?.street}</Text>
							</Text>
							<Text className="text-secondary font-bold  mb-2">
								City:
								<Text className="font-light"> {selectedAddress?.city}</Text>
							</Text>
							<Text className="text-secondary font-bold  mb-2">
								Zipcode:
								<Text className="font-light"> {selectedAddress?.zipCode}</Text>
							</Text>
							<Text className="text-secondary font-bold  mb-2">
								Country:
								<Text className="font-light"> {selectedAddress?.country}</Text>
							</Text>
							<TouchableOpacity
								onPress={() => dispatch(setStep(1))}
								className="mt-3 mb-2"
							>
								<Text className="text-accent font-bold">Change address</Text>
							</TouchableOpacity>
						</View>
						<Text className="text-xl font-bold text-primary mb-2">
							Payment Method
						</Text>

						<Text className="text-secondary mb-5">
							Choose how you want to pay.
						</Text>

						{paymentMethod.map((method) => {
							const selected = checkout.paymentMethod === method.id;

							return (
								<TouchableOpacity
									key={method.id}
									onPress={() =>
										dispatch(setPaymentMethod(method.id as "cash" | "stripe"))
									}
									className="bg-white rounded-xl p-5 mb-3 border-2 flex-row items-center"
									style={{
										borderColor: selected ? COLORS.primary : "#E5E7EB",
									}}
								>
									<Ionicons
										name={method.icon as any}
										size={28}
										color={COLORS.accent}
									/>

									<View className="flex-1 ml-4">
										<Text className="font-bold text-primary">
											{method.title}
										</Text>
										<Text className="text-secondary text-sm mt-1">
											{method.description}
										</Text>
									</View>

									<Ionicons
										name={selected ? "radio-button-on" : "radio-button-off"}
										size={22}
										color={selected ? COLORS.accent : COLORS.secondary}
									/>
								</TouchableOpacity>
							);
						})}
					</View>
				)}

				{/* STEP 3: REVIEW */}
				{checkout.step === 3 && (
					<View>
						<Text className="text-xl font-bold text-primary mb-2">
							Review Your Order
						</Text>

						<Text className="text-secondary mb-5">
							Check everything before placing your order.
						</Text>

						{/* Delivery address */}
						<View className="bg-white rounded-xl p-4 mb-4">
							<Text className="font-bold text-primary mb-3">
								Delivery Address
							</Text>

							<Text className="text-secondary">{selectedAddress?.name}</Text>
							<Text className="text-secondary">{selectedAddress?.phone}</Text>
							<Text className="text-secondary">{selectedAddress?.type}</Text>
							<Text className="text-secondary">{selectedAddress?.street}</Text>
							<Text className="text-secondary">
								{selectedAddress?.city}, {selectedAddress?.zipCode}
							</Text>
							<Text className="text-secondary">{selectedAddress?.country}</Text>

							<TouchableOpacity
								onPress={() => dispatch(setStep(1))}
								className="mt-3"
							>
								<Text className="text-accent font-bold">Change address</Text>
							</TouchableOpacity>
						</View>

						{/* Payment */}
						<View className="bg-white rounded-xl p-4 mb-4">
							<Text className="font-bold text-primary mb-2">
								Payment Method
							</Text>

							<Text className="text-secondary">
								{checkout.paymentMethod === "cash"
									? "Cash on Delivery"
									: "Card Payment (Paystack)"}
							</Text>

							<TouchableOpacity
								onPress={() => dispatch(setStep(2))}
								className="mt-3"
							>
								<Text className="text-accent font-bold">
									Change payment method
								</Text>
							</TouchableOpacity>
						</View>

						{/* Products */}
						<View className="bg-white rounded-xl p-4 mb-4">
							<Text className="font-bold text-primary mb-1">
								Order Items ({cartItems.length})
							</Text>
							<Text className=" text-secondary mb-4">
								Order Quantity ({cartQuantity})
							</Text>

							{cartItems.map((item) => (
								<View
									key={`${item.product._id}-${item.size}`}
									className="flex-row justify-between mb-3"
								>
									<View className="flex-1">
										<Text className="font-semibold text-primary">
											{item.product.name}
										</Text>
										<Text className="text-secondary text-sm">
											Size: {item.size} · Qty: {item.quantity}
										</Text>
									</View>

									<Text className="font-bold text-primary">
										{(item.product.price * item.quantity).toFixed(2)}
									</Text>
								</View>
							))}
						</View>

						{/* Notes */}
						<View className="bg-white rounded-xl p-4 mb-4">
							<Text className="font-bold text-primary mb-3">Order Notes</Text>

							<TextInput
								value={checkout.notes}
								onChangeText={(value) => dispatch(setNotes(value))}
								placeholder="Any special delivery instructions?"
								multiline
								textAlignVertical="top"
								className="bg-surface rounded-lg p-3 min-h-24 text-primary"
							/>
						</View>

						{/* Price summary */}
						<View className="bg-white rounded-xl p-4">
							<Text className="font-bold text-primary text-lg mb-4">
								Order Summary
							</Text>

							<View className="flex-row justify-between mb-3">
								<Text className="text-secondary">Subtotal</Text>
								<Text className="text-primary">{subtotal.toFixed(2)}</Text>
							</View>

							<View className="flex-row justify-between mb-3">
								<Text className="text-secondary">Shipping</Text>
								<Text className="text-primary">{shipping.toFixed(2)}</Text>
							</View>

							<View className="flex-row justify-between mb-3">
								<Text className="text-secondary">Tax</Text>
								<Text className="text-primary">{TAX.toFixed(2)}</Text>
							</View>

							<View className="border-t border-gray-200 pt-3 flex-row justify-between">
								<Text className="font-bold text-primary text-lg">Total</Text>
								<Text className="font-bold text-accent text-lg">
									{total.toFixed(2)}
								</Text>
							</View>
						</View>
					</View>
				)}
			</ScrollView>

			{/* Bottom navigation */}
			<View className="bg-white border-t border-gray-100 px-4 py-4 flex-row items-center">
				{checkout.step > 1 && (
					<TouchableOpacity
						onPress={() => dispatch(prevStep())}
						className="border border-gray-300 rounded-full py-3 px-5 mr-3"
					>
						<Text className="font-bold text-primary">Back</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onPress={handleNext}
					disabled={
						orderLoading || (checkout.step === 1 && addresses.length === 0)
					}
					className="flex-1 rounded-full py-4 items-center"
					style={{
						backgroundColor: COLORS.primary,
						opacity:
							orderLoading || (checkout.step === 1 && addresses.length === 0)
								? 0.5
								: 1,
					}}
				>
					{orderLoading ? (
						<Loading />
					) : (
						<Text className="text-white font-bold">
							{checkout.step === 3 ? "Place Order" : "Continue"}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Checkout;

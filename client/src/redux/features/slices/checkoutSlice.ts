import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CheckoutState, CheckoutStep, PaymentMethod } from "@/constants/types";
import { RootState } from "@/redux/store";

const initialState: CheckoutState = {
	step: 1,
	selectedAddressId: null,
	paymentMethod: "cash",
	notes: "",
	isPlacingOrder: false,
};

const checkoutSlice = createSlice({
	name: "checkout",
	initialState,
	reducers: {
		setStep: (state, action: PayloadAction<CheckoutStep>) => {
			state.step = action.payload;
		},
		nextStep: (state) => {
			if (state.step < 3) state.step = (state.step + 1) as CheckoutStep;
		},
		prevStep: (state) => {
			if (state.step > 1) state.step = (state.step - 1) as CheckoutStep;
		},
		setSelectedAddress: (state, action: PayloadAction<string>) => {
			state.selectedAddressId = action.payload;
		},
		setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
			state.paymentMethod = action.payload;
		},
		setNotes: (state, action: PayloadAction<string>) => {
			state.notes = action.payload;
		},
		setPlacingOrder: (state, action: PayloadAction<boolean>) => {
			state.isPlacingOrder = action.payload;
		},
		resetCheckout: () => initialState,
	},
});

export const {
	setStep,
	nextStep,
	prevStep,
	setSelectedAddress,
	setPaymentMethod,
	setNotes,
	setPlacingOrder,
	resetCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;

export const selectCheckout = (state: RootState) =>
	state.checkout as CheckoutState;

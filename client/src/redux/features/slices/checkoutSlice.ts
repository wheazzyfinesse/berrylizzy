import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/constants/types";

type CheckoutState = {
	step: 1 | 2 | 3; // 1=Address, 2=Payment, 3=Review
	selectedAddressId: string | null;
	paymentMethod: "cash" | "stripe";
	notes: string;
	isPlacingOrder: boolean;
};

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
		setStep: (state, a: PayloadAction<1 | 2 | 3>) => {
			state.step = a.payload;
		},
		nextStep: (state) => {
			if (state.step < 3) state.step = (state.step + 1) as 1 | 2 | 3;
		},
		prevStep: (state) => {
			if (state.step > 1) state.step = (state.step - 1) as 1 | 2 | 3;
		},
		setSelectedAddress: (state, a: PayloadAction<string>) => {
			state.selectedAddressId = a.payload;
		},
		setPaymentMethod: (state, a: PayloadAction<"cash" | "stripe">) => {
			state.paymentMethod = a.payload;
		},
		setNotes: (state, a: PayloadAction<string>) => {
			state.notes = a.payload;
		},
		setPlacingOrder: (state, a: PayloadAction<boolean>) => {
			state.isPlacingOrder = a.payload;
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

export const selectCheckout = (s: any) => s.checkout as CheckoutState;

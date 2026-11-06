import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UiState = {
	toast: {
		message: string;
		type: "success" | "error" | "info";
		visible: boolean;
	};
	isSearchOpen: boolean;
	selectedSize: string;
	selectedProductId: string | null;
	bottomTab: string;
	onboardingDone: boolean;
};

const initialState: UiState = {
	toast: { message: "", type: "info", visible: false },
	isSearchOpen: false,
	selectedSize: "M",
	selectedProductId: null,
	bottomTab: "home",
	onboardingDone: false,
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		showToast: (
			state,
			a: PayloadAction<{
				message: string;
				type?: "success" | "error" | "info";
			}>,
		) => {
			state.toast = {
				message: a.payload.message,
				type: a.payload.type ?? "info",
				visible: true,
			};
		},
		hideToast: (state) => {
			state.toast.visible = false;
		},
		setSearchOpen: (state, a: PayloadAction<boolean>) => {
			state.isSearchOpen = a.payload;
		},
		setSelectedSize: (state, a: PayloadAction<string>) => {
			state.selectedSize = a.payload;
		},
		setSelectedProductId: (state, a: PayloadAction<string | null>) => {
			state.selectedProductId = a.payload;
		},
		setBottomTab: (state, a: PayloadAction<string>) => {
			state.bottomTab = a.payload;
		},
		setOnboardingDone: (state, a: PayloadAction<boolean>) => {
			state.onboardingDone = a.payload;
		},
	},
});

export const {
	showToast,
	hideToast,
	setSearchOpen,
	setSelectedSize,
	setSelectedProductId,
	setBottomTab,
	setOnboardingDone,
} = uiSlice.actions;
export default uiSlice.reducer;

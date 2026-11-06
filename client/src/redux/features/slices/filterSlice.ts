import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SortBy =
	"featured" | "price-low" | "price-high" | "newest" | "rating";
export type CategoryFilter =
	"All" | "Men" | "Women" | "Kids" | "Shoes" | "Bags" | "Other";

type FilterState = {
	search: string;
	category: CategoryFilter;
	sortBy: SortBy;
	priceRange: [number, number];
	sizes: string[];
	onlyFeatured: boolean;
	onlyInStock: boolean;
	isFilterSheetOpen: boolean;
};

const initialState: FilterState = {
	search: "",
	category: "All",
	sortBy: "featured",
	priceRange: [0, 200],
	sizes: [],
	onlyFeatured: false,
	onlyInStock: false,
	isFilterSheetOpen: false,
};

const filterSlice = createSlice({
	name: "filter",
	initialState,
	reducers: {
		setSearch: (state, a: PayloadAction<string>) => {
			state.search = a.payload;
		},
		setCategory: (state, a: PayloadAction<CategoryFilter>) => {
			state.category = a.payload;
		},
		setSortBy: (state, a: PayloadAction<SortBy>) => {
			state.sortBy = a.payload;
		},
		setPriceRange: (state, a: PayloadAction<[number, number]>) => {
			state.priceRange = a.payload;
		},
		toggleSize: (state, a: PayloadAction<string>) => {
			state.sizes = state.sizes.includes(a.payload)
				? state.sizes.filter((s) => s !== a.payload)
				: [...state.sizes, a.payload];
		},
		toggleFeatured: (state) => {
			state.onlyFeatured = !state.onlyFeatured;
		},
		toggleInStock: (state) => {
			state.onlyInStock = !state.onlyInStock;
		},
		setFilterSheetOpen: (state, a: PayloadAction<boolean>) => {
			state.isFilterSheetOpen = a.payload;
		},
		clearFilters: (state) => {
			Object.assign(state, { ...initialState, search: state.search });
		},
		resetAll: () => initialState,
	},
});

export const {
	setSearch,
	setCategory,
	setSortBy,
	setPriceRange,
	toggleSize,
	toggleFeatured,
	toggleInStock,
	setFilterSheetOpen,
	clearFilters,
	resetAll,
} = filterSlice.actions;
export default filterSlice.reducer;

export const selectFilters = (s: any) => s.filter as FilterState;

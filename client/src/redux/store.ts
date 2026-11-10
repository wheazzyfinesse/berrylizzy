import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import cartReducer from "@/redux/features/slices/cartSlice";
import wishlistReducer from "@/redux/features/slices/wishlistSlice";
import themeReducer from "@/redux/features/slices/themeSlice";
import filterReducer from "@/redux/features/slices/filterSlice";
import uiReducer from "@/redux/features/slices/uiSlice";
import authReducer from "@/redux/features/slices/authSlice";
import checkoutReducer from "@/redux/features/slices/checkoutSlice";
import { baseApi } from "./features/apis/api";

const persistConfig = {
	key: "root",
	storage: AsyncStorage,
	whitelist: ["cart", "wishlist", "theme", "filter"], // persist these
	blacklist: ["checkout", "ui", "auth", baseApi.reducerPath], // don't persist transient
};

const rootReducer = combineReducers({
	[baseApi.reducerPath]: baseApi.reducer,
	cart: cartReducer,
	wishlist: wishlistReducer,
	theme: themeReducer,
	filter: filterReducer,
	ui: uiReducer,
	auth: authReducer,
	checkout: checkoutReducer,
});

export const store = configureStore({
	reducer: persistReducer(persistConfig, rootReducer),
	middleware: (gDM) =>
		gDM({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

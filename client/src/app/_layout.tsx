import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
import "@/global.css";
// Import all RTK Query APIs so injectEndpoints registers
import "@/redux/features/apis/productApi";
import "@/redux/features/apis/orderApi";
import "@/redux/features/apis/userApi";
import "@/redux/features/apis/addressApi";
import "@/redux/features/apis/wishlistApi";
import "@/redux/features/apis/cartApi";
import { persistor, store } from "@/redux/store";
import AppInitializer from "@/Providers/AppInitializer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<AppInitializer>
						<Stack screenOptions={{ headerShown: false }} />
						<Toast />
					</AppInitializer>
				</PersistGate>
			</Provider>
		</GestureHandlerRootView>
	);
}

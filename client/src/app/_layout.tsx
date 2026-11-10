import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
import { persistor, store } from "@/redux/store";
import AppInitializer from "@/Providers/AppInitializer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "@/global.css";

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

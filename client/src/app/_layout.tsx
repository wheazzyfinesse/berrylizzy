import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
import { persistor, store } from "@/redux/store";
import AppInitializer from "@/Providers/AppInitializer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}
export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<AppInitializer>
							<Stack screenOptions={{ headerShown: false }} />
							<Toast />
						</AppInitializer>
					</PersistGate>
				</Provider>
			</ClerkProvider>
		</GestureHandlerRootView>
	);
}

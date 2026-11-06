import * as SecureStore from "expo-secure-store";
import { API_URL, USE_DUMMY } from "@/redux/api";

const TOKEN_KEY = "access_token";

export const authService = {
	getToken: async () => {
		return SecureStore.getItemAsync(TOKEN_KEY);
	},

	saveToken: async (token: string) => {
		await SecureStore.setItemAsync(TOKEN_KEY, token);
	},

	removeToken: async () => {
		await SecureStore.deleteItemAsync(TOKEN_KEY);
	},

	restoreSession: async () => {
		if (USE_DUMMY) return null;
		const token = await SecureStore.getItemAsync(TOKEN_KEY);

		if (!token) return null;

		const response = await fetch(`${API_URL}/auth/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			await SecureStore.deleteItemAsync(TOKEN_KEY);
			return null;
		}

		return response.json();
	},
};

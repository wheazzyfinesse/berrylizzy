import { User } from "@/redux/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
	user: User | null;
	clerkId: string | null;
	isGuest: boolean;
	lastRoute: string | null;
};

const initialState: AuthState = {
	user: null,
	clerkId: null,
	isGuest: true,
	lastRoute: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			state.clerkId = action.payload.clerkId;
			state.isGuest = false;
		},
		setClerkId: (state, action: PayloadAction<string>) => {
			state.clerkId = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.clerkId = null;
			state.isGuest = true;
		},
		setGuest: (state, action: PayloadAction<boolean>) => {
			state.isGuest = action.payload;
		},
		setLastRoute: (state, action: PayloadAction<string>) => {
			state.lastRoute = action.payload;
		},
	},
});

export const { setUser, setClerkId, logout, setGuest, setLastRoute } =
	authSlice.actions;
export default authSlice.reducer;

export const selectUser = (s: any) => s.auth.user as User | null;
export const selectIsLoggedIn = (s: any) => !!s.auth.user;
export const selectIsAdmin = (s: any) => s.auth.user?.role === "admin";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Appearance } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
	mode: ThemeMode;
	// Resolved theme after system check
	resolved: "light" | "dark";
	// Brand colors - change once here, whole app changes
	primary: string;
	accent: string;
};

const initialState: ThemeState = {
	mode: "system",
	resolved: Appearance.getColorScheme() ?? "light",
	primary: "#111111",
	accent: "#FF3B30",
};

const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
			state.mode = action.payload;
			if (action.payload !== "system") state.resolved = action.payload;
		},
		setResolvedTheme: (state, action: PayloadAction<"light" | "dark">) => {
			if (state.mode === "system") state.resolved = action.payload;
		},
		setPrimaryColor: (state, action: PayloadAction<string>) => {
			state.primary = action.payload;
		},
	},
});

export const { setThemeMode, setResolvedTheme, setPrimaryColor } =
	themeSlice.actions;
export default themeSlice.reducer;

export const selectThemeMode = (s: any) => s.theme.mode as ThemeMode;
export const selectIsDark = (s: any) => s.theme.resolved === "dark";
export const selectThemeColors = (s: any) => {
	const isDark = s.theme.resolved === "dark";
	return {
		background: isDark ? "#000000" : "#FFFFFF",
		surface: isDark ? "#1C1C1E" : "#F2F2F7",
		text: isDark ? "#FFFFFF" : "#000000",
		textSecondary: isDark ? "#AEAEB2" : "#6C6C70",
		border: isDark ? "#38383A" : "#E5E5EA",
		primary: s.theme.primary,
		accent: s.theme.accent,
		card: isDark ? "#1C1C1E" : "#FFFFFF",
	};
};

import { setResolvedTheme } from "@/redux/features/slices/themeSlice";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { useEffect } from "react";
import { Appearance, useColorScheme } from "react-native";

const ThemeProvider = () => {
	const dispatch = useAppDispatch();
	const scheme = useColorScheme();
	const colorScheme = useColorScheme();
	const themeMode = useAppSelector((state) => state.theme.mode);
	// 2. Apply the correct theme
	useEffect(() => {
		const deviceTheme = colorScheme ?? Appearance.getColorScheme() ?? "light";

		const resolvedTheme = themeMode === "system" ? deviceTheme : themeMode;

		dispatch(setResolvedTheme(resolvedTheme));
	}, [themeMode, colorScheme, dispatch]);
	useEffect(() => {
		if (scheme) dispatch(setResolvedTheme(scheme));
	}, [scheme]);
	return null;
};
export default ThemeProvider;

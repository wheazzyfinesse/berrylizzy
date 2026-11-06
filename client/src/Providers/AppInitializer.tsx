import { useEffect, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, setUser } from "@/redux/features/slices/authSlice";
import { setResolvedTheme } from "@/redux/features/slices/themeSlice";
import { authService } from "@/redux/features/services/authServices";

type Props = {
	children: React.ReactNode;
};
const AppInitializer = ({ children }: Props) => {
	const dispatch = useAppDispatch();
	const colorScheme = useColorScheme();

	const themeMode = useAppSelector((state) => state.theme.mode);

	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const initialize = async () => {
			try {
				// 1. Restore authentication
				const user = await authService.restoreSession();

				if (user) {
					dispatch(setUser(user));
				} else {
					dispatch(logout());
				}
			} catch (error) {
				console.error("App initialization failed:", error);
				dispatch(logout());
			} finally {
				setInitialized(true);
			}
		};

		initialize();
	}, [dispatch]);

	// 2. Apply the correct theme
	useEffect(() => {
		const deviceTheme = colorScheme ?? Appearance.getColorScheme() ?? "light";

		const resolvedTheme = themeMode === "system" ? deviceTheme : themeMode;

		dispatch(setResolvedTheme(resolvedTheme));
	}, [themeMode, colorScheme, dispatch]);

	if (!initialized) {
		return null;
	}

	return <>{children}</>;
};
export default AppInitializer;

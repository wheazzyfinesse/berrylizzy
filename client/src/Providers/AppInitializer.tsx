import { useEffect, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { logout, setUser } from "@/redux/features/slices/authSlice";
import { setResolvedTheme } from "@/redux/features/slices/themeSlice";
import { authService } from "@/redux/features/services/authServices";
import { useAuth } from "@clerk/expo";
import { setApiTokenGetter } from "@/redux/features/services/apiToken";

type Props = {
	children: React.ReactNode;
};
const AppInitializer = ({ children }: Props) => {
	const dispatch = useAppDispatch();
	const colorScheme = useColorScheme();

	const themeMode = useAppSelector((state) => state.theme.mode);

	const [initialized, setInitialized] = useState(false);
	const { getToken, isLoaded, isSignedIn } = useAuth();

	useEffect(() => {
		setApiTokenGetter(getToken);
		return () => setApiTokenGetter(null);
	}, [getToken]);

	useEffect(() => {
		if (!isLoaded) return;

		const initialize = async () => {
			try {
				if (!isSignedIn) {
					dispatch(logout());
					return;
				}

				const user = await authService.restoreSession(getToken);

				if (user) {
					dispatch(setUser(user));
				} else dispatch(logout());
			} catch (error) {
				console.warn("App initialization failed:", error);
				return null;
			} finally {
				setInitialized(true);
			}
		};

		void initialize();
	}, [dispatch, getToken, isLoaded, isSignedIn]);

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

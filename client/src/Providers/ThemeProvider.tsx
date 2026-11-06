import { setResolvedTheme } from "@/redux/features/slices/themeSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

const ThemeProvider = () => {
	const dispatch = useAppDispatch();
	const scheme = useColorScheme();
	useEffect(() => {
		if (scheme) dispatch(setResolvedTheme(scheme));
	}, [scheme]);
	return null;
};
export default ThemeProvider;

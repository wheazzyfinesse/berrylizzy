import { COLORS } from "@/constants";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LoadingProps = {
	message?: string;
};

const Loading = ({ message = "Loading..." }: LoadingProps) => {
	return (
		<SafeAreaView className="flex-1 items-center justify-center">
			<ActivityIndicator size="large" color={COLORS.primary} />

			<Text className="text-sm text-gray-500 mt-3">{message}</Text>
		</SafeAreaView>
	);
};

export default Loading;

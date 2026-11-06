import { View, ActivityIndicator, Text } from "react-native";

type LoadingProps = {
	message?: string;
};

const Loading = ({ message = "Loading..." }: LoadingProps) => {
	return (
		<View className="flex-1 items-center justify-center bg-white">
			<ActivityIndicator size="large" color="#EC4899" />

			<Text className="text-sm text-gray-500 mt-3">{message}</Text>
		</View>
	);
};

export default Loading;

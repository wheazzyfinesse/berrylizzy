import Ionicons from "@react-native-vector-icons/ionicons";
import { View, Text, Pressable } from "react-native";

type ErrorProps = {
	title?: string;
	message?: string;
	onRetry?: () => void;
};

const Error = ({
	title = "Something went wrong",
	message = "We couldn't load the information. Please try again.",
	onRetry,
}: ErrorProps) => {
	return (
		<View className="flex-1 items-center justify-center px-6 bg-white">
			<View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
				<Ionicons name="cloud-offline-outline" size={32} color="#EF4444" />
			</View>

			<Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>

			<Text className="text-sm text-gray-500 text-center mb-6">{message}</Text>

			{onRetry && (
				<Pressable
					onPress={onRetry}
					className="bg-pink-600 px-8 py-3 rounded-full active:opacity-80"
				>
					<Text className="text-white font-semibold">Try Again</Text>
				</Pressable>
			)}
		</View>
	);
};
export default Error;

import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface AuthButtonProps {
	title: string;
	loading?: boolean;
	disabled?: boolean;
	onPress: () => void;
}

const AuthButton = ({
	title,
	loading = false,
	disabled = false,
	onPress,
}: AuthButtonProps) => {
	const isDisabled = loading || disabled;

	return (
		<TouchableOpacity
			className={`w-full py-4 rounded-full items-center ${
				isDisabled ? "bg-gray-400" : "bg-primary"
			}`}
			onPress={onPress}
			disabled={isDisabled}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator color="#fff" />
			) : (
				<Text className="text-white font-bold text-lg">{title}</Text>
			)}
		</TouchableOpacity>
	);
};

export default AuthButton;

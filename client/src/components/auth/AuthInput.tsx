import { Text, TextInput, TextInputProps, View } from "react-native";

interface AuthInputProps extends TextInputProps {
	label: string;
}

const AuthInput = ({ label, ...props }: AuthInputProps) => {
	return (
		<View className="mb-4">
			<Text className="text-primary font-medium mb-2">{label}</Text>

			<TextInput
				className="w-full bg-surface p-4 rounded-xl text-primary"
				placeholderTextColor="#999"
				{...props}
			/>
		</View>
	);
};

export default AuthInput;

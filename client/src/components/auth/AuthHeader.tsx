import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "@/constants";

interface AuthHeaderProps {
	title: string;
	subtitle: string;
	onBack?: () => void;
}

const AuthHeader = ({ title, subtitle, onBack }: AuthHeaderProps) => {
	return (
		<View className="items-center mb-8">
			{onBack && (
				<TouchableOpacity
					onPress={onBack}
					className="absolute left-0 -top-12 z-10"
				>
					<Ionicons name="arrow-back" size={24} color={COLORS.primary} />
				</TouchableOpacity>
			)}

			<Text className="text-3xl font-bold text-primary mb-2">{title}</Text>

			<Text className="text-secondary text-center">{subtitle}</Text>
		</View>
	);
};

export default AuthHeader;

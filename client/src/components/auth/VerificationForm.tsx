import { Text, TextInput, View, TouchableOpacity } from "react-native";

import AuthButton from "./AuthButton";
import AuthHeader from "./AuthHeader";

interface VerificationFormProps {
	code: string;
	onChangeCode: (value: string) => void;
	onSubmit: () => void;
	onResend: () => void;
	loading: boolean;
	title?: string;
	subtitle?: string;
	showResend?: boolean;
}

const VerificationForm = ({
	code,
	onChangeCode,
	onSubmit,
	onResend,
	loading,
	title = "Verify Email",
	subtitle = "Enter the code sent to your email",
	showResend = true,
}: VerificationFormProps) => {
	return (
		<View>
			<AuthHeader title={title} subtitle={subtitle} />

			<View className="mb-6">
				<TextInput
					className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
					placeholder="Enter verification code"
					placeholderTextColor="#999"
					keyboardType="number-pad"
					value={code}
					onChangeText={onChangeCode}
					autoCapitalize="none"
				/>
			</View>

			<AuthButton
				title="Verify"
				loading={loading}
				disabled={!code.trim()}
				onPress={onSubmit}
			/>

			{showResend && (
				<TouchableOpacity
					onPress={onResend}
					disabled={loading}
					className="items-center mt-5"
				>
					<Text className="text-primary font-semibold">
						Resend verification code
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default VerificationForm;

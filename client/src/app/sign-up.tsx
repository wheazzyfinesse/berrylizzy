import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Link, Redirect, useRouter } from "expo-router";
import { useAuth, useSignUp } from "@clerk/expo";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import VerificationForm from "@/components/auth/VerificationForm";

const SignUpScreen = () => {
	const { signUp } = useSignUp();
	const { isSignedIn } = useAuth();
	const router = useRouter();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [pendingVerification, setPendingVerification] = useState(false);
	const [loading, setLoading] = useState(false);

	const onSignUpPress = async () => {
		if (loading) return;

		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!emailAddress.trim() ||
			!password
		) {
			Toast.show({
				type: "error",
				text1: "Missing Fields",
				text2: "Please complete all fields",
			});
			return;
		}

		setLoading(true);

		try {
			const { error } = await signUp.password({
				emailAddress: emailAddress.trim().toLowerCase(),
				password,
				firstName: firstName.trim(),
				lastName: lastName.trim(),
			});

			if (error) {
				Toast.show({
					type: "error",
					text1: "Sign Up Failed",
					text2: error.message,
				});
				return;
			}

			const { error: sendError } = await signUp.verifications.sendEmailCode();

			if (sendError) {
				Toast.show({
					type: "error",
					text1: "Verification Failed",
					text2: sendError.message,
				});
				return;
			}

			setPendingVerification(true);
		} catch (err) {
			Toast.show({
				type: "error",
				text1: "Sign Up Failed",
				text2: "Something went wrong",
			});
		} finally {
			setLoading(false);
		}
	};

	const onVerifyPress = async () => {
		if (loading || !code.trim()) return;

		setLoading(true);

		try {
			const { error } = await signUp.verifications.verifyEmailCode({
				code: code.trim(),
			});

			if (error) {
				Toast.show({
					type: "error",
					text1: "Verification Failed",
					text2: error.message,
				});
				return;
			}

			const { error: finalizeError } = await signUp.finalize();

			if (finalizeError) {
				Toast.show({
					type: "error",
					text1: "Account Activation Failed",
					text2: finalizeError.message,
				});
				return;
			}

			router.replace("/");
		} catch {
			Toast.show({
				type: "error",
				text1: "Verification Failed",
				text2: "Something went wrong",
			});
		} finally {
			setLoading(false);
		}
	};

	const onResendCode = async () => {
		if (loading) return;

		setLoading(true);

		try {
			const { error } = await signUp.verifications.sendEmailCode();

			if (error) {
				Toast.show({
					type: "error",
					text1: "Resend Failed",
					text2: error.message,
				});
				return;
			}

			Toast.show({
				type: "success",
				text1: "Code Sent",
				text2: "A new verification code has been sent.",
			});
		} catch {
			Toast.show({
				type: "error",
				text1: "Resend Failed",
				text2: "Unable to resend code",
			});
		} finally {
			setLoading(false);
		}
	};

	if (isSignedIn) {
		return <Redirect href={"/"} />;
	}
	return (
		<SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={0}
			>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: "center",
						padding: 28,
					}}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{!pendingVerification ? (
						<>
							<AuthHeader
								title="Create Account"
								subtitle="Sign up to get started"
								onBack={() => router.back()}
							/>

							<AuthInput
								label="First Name"
								placeholder="John"
								value={firstName}
								onChangeText={setFirstName}
								autoCapitalize="words"
							/>

							<AuthInput
								label="Last Name"
								placeholder="Doe"
								value={lastName}
								onChangeText={setLastName}
								autoCapitalize="words"
							/>

							<AuthInput
								label="Email"
								placeholder="user@example.com"
								value={emailAddress}
								onChangeText={setEmailAddress}
								autoCapitalize="none"
								keyboardType="email-address"
							/>

							<AuthInput
								label="Password"
								placeholder="********"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
							/>

							<View className="mt-4">
								<AuthButton
									title="Continue"
									loading={loading}
									onPress={onSignUpPress}
								/>
							</View>

							<View className="flex-row justify-center mt-8">
								<Text className="text-secondary">
									Already have an account?{" "}
								</Text>
								<Link href="/sign-in">
									<Text className="text-primary font-bold">Login</Text>
								</Link>
							</View>
						</>
					) : (
						<VerificationForm
							code={code}
							onChangeCode={setCode}
							onSubmit={onVerifyPress}
							onResend={onResendCode}
							loading={loading}
						/>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default SignUpScreen;

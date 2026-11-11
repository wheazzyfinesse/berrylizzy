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
import { useAuth, useSignIn } from "@clerk/expo";

import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthHeader from "@/components/auth/AuthHeader";

const SignInScreen = () => {
	const { isSignedIn } = useAuth();
	const { signIn } = useSignIn();
	const router = useRouter();
	console.log(isSignedIn);
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const onSignInPress = async () => {
		if (loading) return;

		if (!emailAddress.trim() || !password) {
			Toast.show({
				type: "error",
				text1: "Missing Fields",
				text2: "Enter your email and password",
			});
			return;
		}

		setLoading(true);

		try {
			const { error } = await signIn.password({
				emailAddress: emailAddress.trim().toLowerCase(),
				password,
			});

			if (error) {
				Toast.show({
					type: "error",
					text1: "Sign In Failed",
					text2: error.message,
				});
				return;
			}

			if (signIn.status === "complete") {
				await signIn.finalize({
					navigate: ({ session }) => {
						if (session?.currentTask) return;
						router.replace("/");
					},
				});
			}
			Toast.show({
				type: "success",
				text1: "Sign In successful",
			});
		} catch (err) {
			Toast.show({
				type: "error",
				text1: "Sign In Failed",
				text2: err instanceof Error ? err.message : "Unable to sign in",
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
					<>
						<AuthHeader title="Welcome Back" subtitle="Sign in to continue" />

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
								title="Sign In"
								loading={loading}
								disabled={!emailAddress.trim() || !password}
								onPress={onSignInPress}
							/>
						</View>

						<View className="flex-row justify-center mt-8">
							<Text className="text-secondary">Don't have an account? </Text>

							<Link href="/sign-up">
								<Text className="text-primary font-bold">Sign up</Text>
							</Link>
						</View>
					</>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default SignInScreen;

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { COLORS, PROFILE_MENU } from "@/constants";

import { useAppDispatch } from "@/redux/lib/hooks";
import { useUser, useClerk } from "@clerk/expo";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Redirect, useRouter } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Profile = () => {
	// const { data: user, isLoading, isFetching, isError } = useGetMeQuery();
	const router = useRouter();
	const { user, isLoaded, isSignedIn } = useUser();
	const { signOut } = useClerk();

	const dispatch = useAppDispatch();
	const handleSignout = async () => {
		await signOut();
		// dispatch(logout());
		router.replace("/");
	};

	return (
		<SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
			<Header title="My Profile" />
			<ScrollView
				className="flex-1 px-4"
				contentContainerStyle={
					!user
						? { flex: 1, justifyContent: "center", alignItems: "center" }
						: { paddingTop: 16 }
				}
			>
				{!isLoaded ? (
					<Loading />
				) : !user || !isSignedIn ? (
					// Guest User Screen
					<View className="items-center w-full">
						<View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
							<Ionicons name="person" size={20} color={COLORS.secondary} />
						</View>

						<Text className="text-primary font-bold text-xl mb-2">
							Guest User
						</Text>

						<Text className="text-secondary text-base mb-8 text-center w-3/4 px-4">
							Sign in or Sign up to see your profile, orders, and addresses.
						</Text>

						<TouchableOpacity
							onPress={() => router.push("/sign-in")}
							className="bg-primary w-3/5 py-3 rounded-full items-center"
						>
							<Text className="text-white font-bold text-lg">
								Sign in / Sign up
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					// Authenticated User Profile Info
					<>
						<View className="items-center mb-8">
							<View className="mb-3">
								<Image
									className="size-32 border-2 border-white shadow-sm rounded-full"
									source={{ uri: user.imageUrl }}
								/>
							</View>

							<Text className="text-xl text-primary font-bold">
								{user.firstName + " " + user.lastName}
							</Text>
							<Text className="text-secondary text-sm">
								{user.emailAddresses[0].emailAddress}
							</Text>
							{/* Aadmin Panel Button if User is Admin */}
							{user.publicMetadata.role === "admin" && (
								<TouchableOpacity
									onPress={() => router.push("/admin")}
									className="mt-4 flex-row items-center gap-4 bg-primary  py-2 pl-4 pr-2 rounded-full"
								>
									<Text className="text-white font-bold mr-2">Admin Panel</Text>
									<Ionicons
										name="chevron-forward"
										size={20}
										color={COLORS.secondary}
									/>
								</TouchableOpacity>
							)}
						</View>
						{/* Menu */}
						<View className="bg-white rounded-xl border border-gray-100/75 p-2 mb-4">
							{PROFILE_MENU.map((menuItem, index) => (
								<TouchableOpacity
									onPress={() => router.push(menuItem.route as any)}
									key={menuItem.id}
									className={`flex-row items-center p-4 ${index !== PROFILE_MENU.length - 1 ? "border-b border-gray-100" : ""}`}
								>
									<View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4">
										<Ionicons
											name={menuItem.icon as any}
											size={20}
											color={COLORS.primary}
										/>
									</View>
									<Text className="flex-1 text-primary font-medium">
										{menuItem.title}
									</Text>
									<Ionicons
										name="chevron-forward"
										size={20}
										color={COLORS.secondary}
									/>
								</TouchableOpacity>
							))}
						</View>

						{/* Signout Button */}
						<View className="items-center">
							<TouchableOpacity
								onPress={handleSignout}
								className="flex-row items-center justify-center	p-4 border border-red-300 w-4/5 bg-red-50 rounded-full"
							>
								<Text className="text-red-500 font-bold ml-2">Sign out</Text>
							</TouchableOpacity>
						</View>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};
export default Profile;

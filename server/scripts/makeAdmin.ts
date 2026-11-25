import { clerkClient } from "@clerk/express";
import User from "../models/Users.js";

const makeAdmin = async () => {
	try {
		const email = process.env.ADMIN_EMAIL;
		const user = await User.findOneAndUpdate({ email }, { role: "admin" });
		if (!user) {
			throw Error("user not found");
		}
		await clerkClient.users.updateUserMetadata(user.clerkId as string, {
			publicMetadata: { role: "admin" },
		});
	} catch (error: any) {
		console.error("Admin promotion failed:", error.message);
	}
};

export default makeAdmin;

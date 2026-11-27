import { clerkClient } from "@clerk/express";
import User from "../models/Users.js";
const makeAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL?.trim();
        if (!email) {
            console.info("Admin promotion skipped: ADMIN_EMAIL is not set");
            return;
        }
        const user = await User.findOne({ email });
        if (!user) {
            console.info(`Admin promotion skipped: no user found for ${email}`);
            return;
        }
        if (!user.clerkId) {
            console.warn(`Admin promotion skipped: ${email} has no Clerk ID`);
            return;
        }
        await clerkClient.users.updateUserMetadata(user.clerkId, {
            publicMetadata: { role: "admin" },
        });
        user.role = "admin";
        await user.save();
        console.info(`Promoted ${email} to admin`);
    }
    catch (error) {
        console.error("Admin promotion failed:", error instanceof Error ? error.message : error);
        // Swallow the error so it doesn't prevent the server from starting.
    }
};
export default makeAdmin;
//# sourceMappingURL=makeAdmin.js.map
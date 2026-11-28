import { verifyWebhook } from "@clerk/express/webhooks";
import type { Request, Response } from "express";
import User from "../../models/Users.js";

export const clerkWebhook = async (req: Request, res: Response) => {
	try {
		const event = await verifyWebhook(req);
		if (event.type === "user.created" || event.type === "user.updated") {
			const user = await User.findOne({ clerkId: event.data.id });

			const userData = {
				clerkId: event.data.id,

				name: event.data?.first_name + " " + event.data?.last_name,
				image: event.data?.image_url,
				...(event.data.email_addresses[0]?.email_address && {
					email: event.data.email_addresses[0].email_address,
				}),
			};

			if (user) {
				await User.findOneAndUpdate({ clerkId: event.data.id }, userData);
			} else {
				await User.create(userData);
			}
		}
		if (event.type === "user.deleted") {
			const { id } = event.data;

			if (!id) {
				throw new Error("User ID is required");
			}
			await User.findOneAndDelete({ clerkId: id });
		}
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return res.status(400).send("Error verifying webhook");
	}
};

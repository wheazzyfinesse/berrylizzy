import mongoose from "mongoose";
import type { IUser } from "../types/index.js";

const userSchema = new mongoose.Schema<IUser>(
	{
		clerkId: { type: String },
		name: { type: String, trim: true },
		email: { type: String, unique: true, trim: true },
		image: { type: String },
		role: { type: String, enum: ["user", "admin"], default: "user" },
	},
	{ timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;

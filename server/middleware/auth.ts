import type { Request, Response, NextFunction } from "express";
import User from "../models/Users.js";
import { getAuth } from "@clerk/express";

export const protect = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const getauth = req.auth();
		console.log(req);
		const { userId } = getAuth(req);
		console.log(userId);
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized 1",
			});
		}

		let user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User account not found",
			});
		}
		req.user = user;
		next();
	} catch (error) {
		console.error("Auth error:", error);
		res.status(500).json({
			success: false,
			message: "Authentication failed",
		});
	}
};

export const authorize = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "User role is not authorized to access this route",
			});
		}
		next();
	};
};

// controllers/authControllers.ts
// GET /api/auth/me
export const getMe = (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ message: "Not authorized from me" });
	}

	const user = req.user;

	return res.status(200).json({
		_id: String(user._id),
		clerkId: user.clerkId,
		name: user.name,
		email: user.email,
		image: user.image,
		role: user.role,
	});
};

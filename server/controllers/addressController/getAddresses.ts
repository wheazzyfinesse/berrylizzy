import type { Request, Response } from "express";
import Address from "../../models/addressses.js";

const getAddresses = async (req: Request, res: Response) => {
	const userId = req.user?._id;
	if (!userId) {
		return res.status(401).json("Unauthorized");
	}
	try {
		const addresses = await Address.find({ user: userId }).sort({
			isDefault: -1,
			createdAt: -1,
		});
		res.status(201).json(addresses);
	} catch (error: any) {
		console.error(error);
		res.status(500).json(error.message);
	}
};

export default getAddresses;

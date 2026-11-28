import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Address from "../../models/addressses.js";

const getAddress = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const id = req.params.id;
		if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
			return res.status(400).json("Invalid address ID");
		}

		const address = await Address.findOne({
			_id: id,
			user: req.user._id,
		});

		if (!address) {
			return res.status(404).json("Address not found");
		}

		return res.status(200).json(address);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not get address");
	}
};

export default getAddress;

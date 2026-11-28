import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
	getAddressInput,
	hasRequiredAddressFields,
} from "../../utils/others/addressUtils.js";
import Address from "../../models/addressses.js";

const createAddress = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json("Unauthorized");
	}

	const data = getAddressInput(req.body);

	if (!hasRequiredAddressFields(data)) {
		return res
			.status(400)
			.json({ message: "Address fields are invalid or missing" });
	}

	if (data.isDefault !== undefined && typeof data.isDefault !== "boolean") {
		return res.status(400).json("isDefault must be a boolean");
	}

	const session = await mongoose.startSession();
	let createdAddress: InstanceType<typeof Address> | undefined;

	try {
		await session.withTransaction(async () => {
			const existingCount = await Address.countDocuments({
				user: req.user!._id,
			}).session(session);

			const makeDefault = data.isDefault === true || existingCount === 0;

			if (makeDefault) {
				await Address.updateMany(
					{ user: req.user!._id, isDefault: true },
					{ $set: { isDefault: false } },
					{ session },
				);
			}

			const address = new Address({
				user: req.user!._id,
				...data,
				isDefault: makeDefault,
			});

			await address.save({ session });
			createdAddress = address;
		});

		if (!createdAddress) {
			throw new Error("Address was not created");
		}

		return res.status(201).json(createdAddress);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not create address");
	} finally {
		await session.endSession();
	}
};

export default createAddress;

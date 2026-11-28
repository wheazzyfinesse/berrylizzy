import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Address from "../../models/addressses.js";

const deleteAddress = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json("Unauthorized");
	}

	const id = req.params.id;
	if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
		return res.status(400).json("Invalid address ID");
	}

	const session = await mongoose.startSession();
	let addressNotFound = false;

	try {
		await session.withTransaction(async () => {
			const address = await Address.findOne({
				_id: id,
				user: req.user!._id,
			}).session(session);

			if (!address) {
				addressNotFound = true;
				return;
			}

			const wasDefault = address.isDefault;
			await address.deleteOne({ session });

			if (wasDefault) {
				const nextDefault = await Address.findOne({
					user: req.user!._id,
				})
					.sort({ createdAt: 1 })
					.session(session);

				if (nextDefault) {
					nextDefault.isDefault = true;
					await nextDefault.save({ session });
				}
			}
		});

		if (addressNotFound) {
			return res.status(404).json("Address not found");
		}

		return res.status(200).json(true);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not delete address");
	} finally {
		await session.endSession();
	}
};

export default deleteAddress;

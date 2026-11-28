import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { validTypes } from "../../types/index.js";
import Address from "../../models/addressses.js";

const updateAddress = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json("Unauthorized");
	}

	const id = req.params.id;
	if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
		return res.status(400).json("Invalid address ID");
	}

	const body = req.body ?? {};

	if (body.type !== undefined && !validTypes.includes(body.type)) {
		return res.status(400).json("Invalid address type");
	}

	for (const field of [
		"street",
		"city",
		"state",
		"zipCode",
		"country",
		"phone",
	]) {
		if (
			body[field] !== undefined &&
			(typeof body[field] !== "string" || body[field].trim().length === 0)
		) {
			return res.status(400).json(`${field} must be a non-empty string`);
		}
	}

	if (body.isDefault !== undefined && typeof body.isDefault !== "boolean") {
		return res.status(400).json("isDefault must be a boolean");
	}

	const session = await mongoose.startSession();
	let updatedAddress: InstanceType<typeof Address> | undefined;
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

			if (body.type !== undefined) address.type = body.type;
			if (body.street !== undefined) address.street = body.street.trim();
			if (body.city !== undefined) address.city = body.city.trim();
			if (body.state !== undefined) address.state = body.state.trim();
			if (body.zipCode !== undefined) address.zipCode = body.zipCode.trim();
			if (body.country !== undefined) address.country = body.country.trim();
			if (body.phone !== undefined) address.phone = body.phone.trim();

			if (body.isDefault === true) {
				await Address.updateMany(
					{
						user: req.user!._id,
						_id: { $ne: address._id },
						isDefault: true,
					},
					{ $set: { isDefault: false } },
					{ session },
				);
				address.isDefault = true;
			} else if (body.isDefault === false) {
				address.isDefault = false;
			}

			await address.save({ session });
			updatedAddress = address;
		});

		if (addressNotFound) {
			return res.status(404).json("Address not found");
		}

		if (!updatedAddress) {
			throw new Error("Address was not updated");
		}

		return res.status(200).json(updatedAddress);
	} catch (error) {
		console.error(error);
		return res.status(500).json("Could not update address");
	} finally {
		await session.endSession();
	}
};

export default updateAddress;

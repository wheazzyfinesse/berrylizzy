import mongoose, { Types } from "mongoose";
import Address from "../models/addressses.js";
const validTypes = ["Home", "Work", "Other"];
const getAddressInput = (body) => ({
    type: body?.type,
    street: body?.street,
    city: body?.city,
    state: body?.state,
    zipCode: body?.zipCode,
    country: body?.country,
    phone: body?.phone,
    isDefault: body?.isDefault,
});
const hasRequiredAddressFields = (data) => validTypes.includes(data.type) &&
    ["street", "city", "state", "zipCode", "country", "phone"].every((key) => typeof data[key] === "string" &&
        data[key].trim().length > 0);
export const getAddresses = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json(error.message);
    }
};
export const getAddressById = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not get address");
    }
};
export const addAddress = async (req, res) => {
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
    let createdAddress;
    try {
        await session.withTransaction(async () => {
            const existingCount = await Address.countDocuments({
                user: req.user._id,
            }).session(session);
            const makeDefault = data.isDefault === true || existingCount === 0;
            if (makeDefault) {
                await Address.updateMany({ user: req.user._id, isDefault: true }, { $set: { isDefault: false } }, { session });
            }
            const address = new Address({
                user: req.user._id,
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not create address");
    }
    finally {
        await session.endSession();
    }
};
export const updateAddress = async (req, res) => {
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
        if (body[field] !== undefined &&
            (typeof body[field] !== "string" || body[field].trim().length === 0)) {
            return res.status(400).json(`${field} must be a non-empty string`);
        }
    }
    if (body.isDefault !== undefined && typeof body.isDefault !== "boolean") {
        return res.status(400).json("isDefault must be a boolean");
    }
    const session = await mongoose.startSession();
    let updatedAddress;
    let addressNotFound = false;
    try {
        await session.withTransaction(async () => {
            const address = await Address.findOne({
                _id: id,
                user: req.user._id,
            }).session(session);
            if (!address) {
                addressNotFound = true;
                return;
            }
            if (body.type !== undefined)
                address.type = body.type;
            if (body.street !== undefined)
                address.street = body.street.trim();
            if (body.city !== undefined)
                address.city = body.city.trim();
            if (body.state !== undefined)
                address.state = body.state.trim();
            if (body.zipCode !== undefined)
                address.zipCode = body.zipCode.trim();
            if (body.country !== undefined)
                address.country = body.country.trim();
            if (body.phone !== undefined)
                address.phone = body.phone.trim();
            if (body.isDefault === true) {
                await Address.updateMany({
                    user: req.user._id,
                    _id: { $ne: address._id },
                    isDefault: true,
                }, { $set: { isDefault: false } }, { session });
                address.isDefault = true;
            }
            else if (body.isDefault === false) {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not update address");
    }
    finally {
        await session.endSession();
    }
};
export const deleteAddress = async (req, res) => {
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
                user: req.user._id,
            }).session(session);
            if (!address) {
                addressNotFound = true;
                return;
            }
            const wasDefault = address.isDefault;
            await address.deleteOne({ session });
            if (wasDefault) {
                const nextDefault = await Address.findOne({
                    user: req.user._id,
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Could not delete address");
    }
    finally {
        await session.endSession();
    }
};
//# sourceMappingURL=addressControllers.js.map
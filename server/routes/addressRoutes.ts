import express from "express";
import getAddresses from "../controllers/addressController/getAddresses.js";
import getAddress from "../controllers/addressController/getAddress.js";
import createAddress from "../controllers/addressController/createAddress.js";
import updateAddress from "../controllers/addressController/updateAdress.js";
import deleteAddress from "../controllers/addressController/deleteAddress.js";
import { protect } from "../middleware/auth.js";

const AddressRouter = express.Router();

// Get all addresses
AddressRouter.get("/", protect, getAddresses);
// Get an address
AddressRouter.get("/:id", protect, getAddress);
// Create an address
AddressRouter.post("/", protect, createAddress);
// Update an address
AddressRouter.patch("/:id", protect, updateAddress);
// Delete an address
AddressRouter.delete("/:id", protect, deleteAddress);

export default AddressRouter;

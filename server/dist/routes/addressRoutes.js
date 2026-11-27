import express from "express";
import { addAddress, deleteAddress, getAddressById, getAddresses, updateAddress, } from "../controllers/addressControllers.js";
import { protect } from "../middleware/auth.js";
const AddressRouter = express.Router();
AddressRouter.get("/", protect, getAddresses);
AddressRouter.get("/:id", protect, getAddressById);
AddressRouter.post("/", protect, addAddress);
AddressRouter.patch("/:id", protect, updateAddress);
AddressRouter.delete("/:id", protect, deleteAddress);
export default AddressRouter;
//# sourceMappingURL=addressRoutes.js.map
import express from "express";
import {
	createProduct,
	deleteProduct,
	getProduct,
	getProducts,
	updateProduct,
} from "../controllers/productControllers.js";
import { authorize, protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const ProductRouter = express.Router();

// Get All products
ProductRouter.get("/", getProducts);

// Get Single product
ProductRouter.get("/:id", getProduct);

// Create product (Admin only)
ProductRouter.post(
	"/",
	upload.array("images", 5),
	protect,
	authorize("admin"),
	createProduct,
);

// Update product (Admin only)
ProductRouter.put(
	"/:id",
	upload.array("images", 5),
	protect,
	authorize("admin"),
	updateProduct,
);

// Delete product (Admin only)
ProductRouter.delete("/:id", protect, authorize("admin"), deleteProduct);

export default ProductRouter;

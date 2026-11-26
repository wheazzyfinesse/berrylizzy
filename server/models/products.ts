import mongoose, { Schema } from "mongoose";
import type { IProduct } from "../types/index.js";

const productsSchema = new Schema<IProduct>(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, required: true },
		price: { type: Number, required: true, min: 0 },
		images: [{ type: String }],
		sizes: [
			{
				type: String,
				enum: ["S", "M", "L", "XL", "XXL"],
			},
		],
		category: {
			type: String,
			required: true,
			enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Others"],
			default: "Other",
		},
		stock: { type: Number, required: true, default: 0, min: 0 },
		isFeatured: { type: Boolean, default: true },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

productsSchema.index({ name: "text", description: "text" });

const Product = mongoose.model<IProduct>("Product", productsSchema);
export default Product;

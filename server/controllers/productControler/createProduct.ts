import { type Request, type Response } from "express";
import cloudinary from "../../utils/config/cloudinary.js";
import Product from "../../models/products.js";

// Create Product
// POST /api/products
const createProduct = async (req: Request, res: Response) => {
	try {
		let images = [];

		// Handle File Upload
		const files = (req.files ?? []) as Express.Multer.File[];
		const uploadPromises: Promise<string>[] = files.map(
			(file) =>
				new Promise<string>((resolve, reject) => {
					const uploadStream = cloudinary.uploader.upload_stream(
						{ folder: "berrylizzy/products" },
						(error, result) => {
							if (error) return reject(error);
							if (!result)
								return reject(new Error("Cloudinary returned no result"));

							resolve(result.secure_url);
						},
					);

					uploadStream.end(file.buffer);
				}),
		);

		images = await Promise.all(uploadPromises);

		let sizes = req.body.sizes || [];
		if (typeof sizes === "string") {
			try {
				sizes = JSON.parse(sizes);
			} catch (e) {
				sizes = sizes
					.split(",")
					.map((s: string) => s.trim())
					.filter((s: string) => s !== "");
			}
		}

		// Ensure they are arrays
		if (!Array.isArray(sizes)) sizes = [sizes];

		const productData = {
			...req.body,
			images: images,
			sizes,
		};

		if (images.length === 0) {
			return res.status(400).json("Please upload atleast one image");
		}
		const product = await Product.create(productData);

		res.status(201).json(product);
	} catch (error: any) {
		console.log(error);
		res.status(500).json(error.message);
	}
};

export default createProduct;

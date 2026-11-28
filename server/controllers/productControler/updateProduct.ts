import { type Request, type Response } from "express";
import cloudinary from "../../utils/config/cloudinary.js";
import Product from "../../models/products.js";

// Update Single Product
// PUT /api/products/:id
 const updateProduct = async (req: Request, res: Response) => {
	try {
		const updates = { ...req.body };
		let images: string[] = [];

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

		if (
			req.body.existingImages ||
			(req.files && (req.files as any).length > 0)
		) {
			updates.images = [...req.body.existingImages, ...images];
		}
		delete updates.existingImages;

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
		updates.sizes = sizes;

		const product = await Product.findByIdAndUpdate(req.params.id, updates, {
			returnDocument: "after",
			runValidators: true,
		});
		if (!product) {
			return res.status(404).json("Could not update, Product not found");
		}
		res.json(product);
	} catch (error: any) {
		console.log(error);
		res.status(500).json(error.message);
	}
};

export default updateProduct;
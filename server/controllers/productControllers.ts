import { type Request, type Response } from "express";
import Product from "../models/products.js";
import cloudinary from "../utils/cloudinary.js";

// Get All Products
// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const query: any = { isActive: true };

		const total = await Product.countDocuments(query);
		const products = await Product.find(query)
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));

		res.status(200).json({
			products,
			pagination: {
				total,
				page: Number(page),
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};

// Get Single Product
// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json("Product not found");
		}
		res.json(product);
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};

// Create Product
// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
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

// Update Single Product
// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
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

// Delete Product
// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	try {
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json("Could not delete, product not found");
		}

		// Delete Images from Cloudinary
		if (product.images && product.images.length > 0) {
			const deletePromises = product.images.map((imageUrl) => {
				const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
				const publicId = publicIdMatch ? publicIdMatch[1] : null;
				if (publicId) {
					return cloudinary.uploader.destroy(publicId);
				}
				return Promise.resolve();
			});
			await Promise.all(deletePromises);
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json("Product deleted");
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};

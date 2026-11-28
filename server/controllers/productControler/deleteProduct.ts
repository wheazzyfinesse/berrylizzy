import { type Request, type Response } from "express";
import Product from "../../models/products.js";
import cloudinary from "../../utils/config/cloudinary.js";

// Delete Product
// DELETE /api/products/:id
const deleteProduct = async (req: Request, res: Response) => {
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

export default deleteProduct;

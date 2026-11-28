import { type Request, type Response } from "express";
import Product from "../../models/products.js";

// Get Single Product
// GET /api/products/:id
const getProduct = async (req: Request, res: Response) => {
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

export default getProduct;

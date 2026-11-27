import {} from "express";
import Product from "../models/products.js";
import cloudinary from "../utils/cloudinary.js";
// Get All Products
// GET /api/products
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = { isActive: true };
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
    }
    catch (error) {
        res.status(500).json(error.message);
    }
};
// Get Single Product
// GET /api/products/:id
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json("Product not found");
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json(error.message);
    }
};
// Create Product
// POST /api/products
export const createProduct = async (req, res) => {
    try {
        let images = [];
        // Handle File Upload
        const files = (req.files ?? []);
        const uploadPromises = files.map((file) => new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "berrylizzy/products" }, (error, result) => {
                if (error)
                    return reject(error);
                if (!result)
                    return reject(new Error("Cloudinary returned no result"));
                resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        }));
        images = await Promise.all(uploadPromises);
        let sizes = req.body.sizes || [];
        if (typeof sizes === "string") {
            try {
                sizes = JSON.parse(sizes);
            }
            catch (e) {
                sizes = sizes
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s !== "");
            }
        }
        // Ensure they are arrays
        if (!Array.isArray(sizes))
            sizes = [sizes];
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
};
// Update Single Product
// PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const updates = { ...req.body };
        let images = [];
        // Handle File Upload
        const files = (req.files ?? []);
        const uploadPromises = files.map((file) => new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "berrylizzy/products" }, (error, result) => {
                if (error)
                    return reject(error);
                if (!result)
                    return reject(new Error("Cloudinary returned no result"));
                resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        }));
        images = await Promise.all(uploadPromises);
        if (req.body.existingImages ||
            (req.files && req.files.length > 0)) {
            updates.images = [...req.body.existingImages, ...images];
        }
        delete updates.existingImages;
        let sizes = req.body.sizes || [];
        if (typeof sizes === "string") {
            try {
                sizes = JSON.parse(sizes);
            }
            catch (e) {
                sizes = sizes
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s !== "");
            }
        }
        // Ensure they are arrays
        if (!Array.isArray(sizes))
            sizes = [sizes];
        updates.sizes = sizes;
        const product = await Product.findByIdAndUpdate(req.params.id, updates, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json("Could not update, Product not found");
        }
        res.json(product);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
};
// Delete Product
// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json(error.message);
    }
};
//# sourceMappingURL=productControllers.js.map
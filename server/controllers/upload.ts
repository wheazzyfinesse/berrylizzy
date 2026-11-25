import { extractPublicId } from "../utils";

// utils/cloudinaryUploader.ts
export const uploadImagesToCloudinary = async (
	images: (string | File)[],
): Promise<string[]> => {
	try {
		const uploadedImageUrls = await Promise.all(
			images.map(async (image) => {
				if (typeof image === "string") return image;

				const formData = new FormData();
				formData.append("file", image);
				formData.append(
					"upload_preset",
					process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
				);

				const response = await fetch(
					`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
					{
						method: "POST",
						body: formData,
					},
				);

				if (!response.ok) {
					throw new Error(`Failed to upload image: ${response.statusText}`);
				}

				const data = await response.json();
				return data.secure_url;
			}),
		);

		return uploadedImageUrls;
	} catch (error) {
		console.error("Error uploading images to Cloudinary", error);
		throw error;
	}
};

export const deleteImagesFromCloudinar = async (images: string[]) => {
	try {
		const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
		const apiKey = process.env.CLOUDINARY_API_KEY || "";
		const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

		const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/delete_by_ids`;

		// Encode API credentials for Basic Auth
		const authHeader = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;

		const imagePublicIds = images.map(
			(url) => extractPublicId(url), // Extract the public_id from the URL
		);
		console.log(imagePublicIds);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
			body: JSON.stringify({ public_ids: imagePublicIds }),
		});
		console.log(response);
		if (!response.ok) {
			throw new Error(`Failed to delete images: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Deleted images:", data);
		return data;
	} catch (error) {
		console.error("Error deleting images from Cloudinary", error);
		throw error;
	}
};

export const deleteImagesFromCloudinary = async (urls: string[]) => {
	try {
		const publicIds = urls.map((url) => extractPublicId(url)); // Extract public IDs with folders

		const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
		const apiKey = process.env.CLOUDINARY_API_KEY || "";
		const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

		const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/delete_by_ids`;

		// Encode API credentials for Basic Auth
		const authHeader = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
			body: JSON.stringify({ public_ids: publicIds }),
		});

		if (!response.ok) {
			throw new Error(`Failed to delete images: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Deleted images:", data);
		return data;
	} catch (error) {
		console.error("Error deleting images from Cloudinary", error);
		throw error;
	}
};

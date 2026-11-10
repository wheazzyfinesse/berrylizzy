import { Category } from "./category";
import type { BaseEntity, ID, PaginationParams, Rating } from "./common";

export interface Product extends BaseEntity {
	name: string;
	description: string;
	price: number;
	comparePrice?: number;
	images: string[];
	sizes: string[];
	category: Category | ID;
	stock: number;
	ratings: Rating;
	isFeatured: boolean;
	isActive: boolean;
}

export interface ProductFilters extends PaginationParams {
	category?: Category;
	search?: string;
	featured?: boolean;
}

export type CreateProductInput = Omit<Product, "_id" | "createdAt">;

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductCardProps {
	product: Product;
}

import type { BaseEntity, ID } from "./common";

export interface Category extends BaseEntity {
	name: string;
	icon: string;
	slug: string;
	description?: string;
	image?: string;
	parentCategory?: ID | Category | null;
	isActive: boolean;
	sortOrder: number;
}

export interface CreateCategoryInput {
	name: string;
	slug?: string;
	description?: string;
	image?: string;
	parentCategory?: ID | null;
	isActive?: boolean;
	sortOrder?: number;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CategoryFilters {
	search?: string;
	parentCategory?: ID | null;
	isActive?: boolean;
}

export interface CategoryItemProps {
	item: Category;
	isSelected?: boolean;
	onPress?: () => void;
}

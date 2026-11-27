export type ID = string;

export type ISODateString = string;

export const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"] as const;

export type SizeOption = (typeof SIZE_OPTIONS)[number];

export type AddressType = "Home" | "Office" | "Work" | "Other";

export const addressTypes: AddressType[] = ["Home", "Work", "Other"];

export type UserRole = "user" | "admin";

export type PaymentMethod = "cash" | "paystack";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
	"placed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Rating {
	average: number;
	count: number;
}

export interface BaseEntity {
	_id: ID;
	createdAt: ISODateString;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export type HeaderProps = {
	title?: string;
	showBack?: boolean;
	showSearch?: boolean;
	showCart?: boolean;
	showMenu?: boolean;
	showLogo?: boolean;
};

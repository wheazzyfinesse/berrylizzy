export type ID = string;
export type ISODateString = string;

export type AddressType = "Home" | "Office" | "Work" | "Other";

export type UserRole = "user" | "admin";

export type PaymentMethod = "cash" | "paystack" | "stripe";

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

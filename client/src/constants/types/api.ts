import { ID } from "./common";

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data: T;
}

export interface ApiListResponse<T> {
	success: boolean;
	message?: string;
	data: T[];
}

export interface ApiPaginationResponse<T> {
	success: boolean;
	message?: string;
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface DeleteResponse {
	success: boolean;
	message: string;
}

export interface EntityIdParams {
	id: ID;
}

import type { BaseEntity, AddressType, ID } from "./common";

export interface Address extends BaseEntity {
	user?: ID;
	type: AddressType;
	phone: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	isDefault: boolean;
}

export type AddAddressRequest = Omit<
	Address,
	"_id" | "user" | "createdAt" | "updatedAt"
>;

export type UpdateAddressInput = Partial<AddAddressRequest>;

export interface AddressApiResponse {
	sucess: boolean;
	data: Address[];
}

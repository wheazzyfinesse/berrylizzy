import type { BaseEntity, AddressType, ID } from "./common";

export interface Address extends BaseEntity {
	user?: ID;
	type: AddressType;
	name: string;
	phone: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	isDefault: boolean;
}
export type CreateAddressInput = Omit<Address, "_id" | "createdAt" | "user">;

export type UpdateAddressInput = Partial<CreateAddressInput>;

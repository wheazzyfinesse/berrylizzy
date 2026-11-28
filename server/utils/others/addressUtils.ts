import { validTypes } from "../../types/index.js";

export const getAddressInput = (body: any) => ({
	type: body?.type,
	street: body?.street,
	city: body?.city,
	state: body?.state,
	zipCode: body?.zipCode,
	country: body?.country,
	phone: body?.phone,
	isDefault: body?.isDefault,
});

export const hasRequiredAddressFields = (
	data: ReturnType<typeof getAddressInput>,
) =>
	validTypes.includes(data.type) &&
	["street", "city", "state", "zipCode", "country", "phone"].every(
		(key) =>
			typeof data[key as keyof typeof data] === "string" &&
			data[key as keyof typeof data]!.trim().length > 0,
	);

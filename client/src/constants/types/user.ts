import type { BaseEntity, UserRole } from "./common";

export interface ClerkEmailAddress {
	emailAddress: string;
}

export interface UserMetadata {
	role?: UserRole;
	[key: string]: unknown;
}

export interface User extends BaseEntity {
	name: string;
	email: string;
	firstName?: string;
	lastName?: string;
	imageUrl?: string;
	emailAddresses?: ClerkEmailAddress[];
	clerkId: string;
	role: UserRole;
	publicMetadata?: UserMetadata;
	phone?: string;
}

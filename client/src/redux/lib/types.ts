export type Category = "Men" | "Women" | "Kids" | "Shoes" | "Bags" | "Other";

export type Product = {
	_id: string;
	name: string;
	description: string;
	price: number;
	comparePrice?: number;
	images: string[];
	sizes: string[];
	category: Category;
	stock: number;
	ratings: { average: number; count: number };
	isFeatured: boolean;
	isActive: boolean;
	createdAt: string;
};

export type CartItem = {
	_id: string;
	product: Product;
	quantity: number;
	price: number;
	size: string;
};

export type Cart = {
	_id: string;
	items: CartItem[];
	totalAmount: number;
};

export type OrderItem = {
	_id: string;
	product: Product;
	name: string;
	quantity: number;
	price: number;
	size?: string;
};

export type Order = {
	_id: string;
	orderNumber: string;
	items: OrderItem[];
	shippingAddress: Address;
	paymentMethod: "cash" | "stripe";
	paymentStatus: "pending" | "paid" | "failed" | "refunded";
	orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
	subtotal: number;
	shippingCost: number;
	tax: number;
	totalAmount: number;
	createdAt: string;
};

export type Address = {
	_id: string;
	type: "Home" | "Work" | "Other" | "Office";
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	isDefault: boolean;
};

export type User = {
	_id: string;
	name: string;
	email: string;
	clerkId: string;
	imageUrl?: string;
	role: "user" | "admin";
};

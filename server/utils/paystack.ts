const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

type PaystackInitializeResponse = {
	status: boolean;
	message: string;
	data?: {
		authorization_url: string;
		reference: string;
	};
};

export async function initializePaystackCheckout({
	amountInNaira,
	email,
	orderId,
}: {
	amountInNaira: number;
	email: string;
	orderId: string;
}) {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("PAYSTACK_SECRET_KEY is not configured");
	}

	const response = await fetch(
		"https://api.paystack.co/transaction/initialize",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: String(Math.round(amountInNaira * 100)), // Paystack expects kobo
				email,
				currency: "NGN",
				callback_url: `${process.env.PUBLIC_API_URL}/api/payments/paystack/callback`,
				metadata: { orderId },
			}),
		},
	);

	const result = (await response.json()) as PaystackInitializeResponse;

	if (!response.ok || !result.status || !result.data) {
		throw new Error(result.message || "Could not initialize Paystack checkout");
	}

	return result.data;
}

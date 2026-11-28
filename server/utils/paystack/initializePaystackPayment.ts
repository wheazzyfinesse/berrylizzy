import type {
	InitializePaymentRequest,
	PaystackResponse,
	PaystackResult,
	ResultDataResponse,
} from "./paystackTypes.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const initializePaystackPayment = async ({
	amountInNaira,
	email,
	orderId,
	reference,
}: InitializePaymentRequest): Promise<PaystackResponse<ResultDataResponse>> => {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("PAYSTACK_SECRET_KEY is not configured");
	}

	const cancelActionUrl = new URL(
		"/api/orders/payments/paystack/cancel",
		process.env.PUBLIC_API_URL,
	);
	cancelActionUrl.searchParams.set("orderId", orderId);
	cancelActionUrl.searchParams.set("reference", reference);

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
				reference,
				callback_url: `${process.env.PUBLIC_API_URL}/api/orders/payments/paystack/verify/callback`,
				metadata: {
					orderId,
					cancel_action: cancelActionUrl.toString(),
				},
			}),
		},
	);

	const result = (await response.json()) as PaystackResult<ResultDataResponse>;

	if (!response.ok || !result.status || !result.data) {
		throw new Error(
			result.message || "Could not initialize Paystack Payment Checkout",
		);
	}

	return { response, result };
};

export default initializePaystackPayment;

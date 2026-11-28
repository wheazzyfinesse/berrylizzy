import type {
	PaystackResponse,
	PaystackResult,
	VerifyPaymentDataResult,
} from "./paystackTypes.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const verifyPaystackPayment = async (
	reference: string,
): Promise<PaystackResponse<VerifyPaymentDataResult>> => {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("PAYSTACK_SECRET_KEY is not configured");
	}
	const response = await fetch(
		`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
		{ headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
	);

	const result =
		(await response.json()) as PaystackResult<VerifyPaymentDataResult>;

	if (!response.ok || !result.status || !result.data) {
		throw new Error(
			result.message || "Could not initialize Paystack Payment Checkout",
		);
	}

	return { response, result };
};

export default verifyPaystackPayment;

import type {
	PaystackResponse,
	PaystackResult,
	RefundDataResponse,
	RefundRequest,
} from "./paystackTypes.js";

const refundPaystackPayment = async ({
	paidAttemptReference,
	refundReference,
}: RefundRequest): Promise<PaystackResponse<RefundDataResponse>> => {
	const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("PAYSTACK_SECRET_KEY is not configured");
	}

	const response = await fetch("https://api.paystack.co/refund", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			transaction: paidAttemptReference,
			reference: refundReference,
			currency: "NGN",
			customer_note: "Refund for cancelled order",
		}),
	});

	const result = (await response.json()) as PaystackResult<RefundDataResponse>;

	if (!response.ok || !result.status || !result.data) {
		throw new Error(
			result.message || "Could not initialize Paystack Payment Checkout",
		);
	}

	return { response, result };
};

export default refundPaystackPayment;

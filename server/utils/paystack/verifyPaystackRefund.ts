import type {
	PaystackResponse,
	PaystackResult,
	RefundDataResponse,
} from "./paystackTypes.js";

const verifyPaystackRefund = async (
	refundReference: string,
): Promise<RefundDataResponse | null> => {
	const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("PAYSTACK_SECRET_KEY is not configured");
	}

	const response = await fetch(
		`https://api.paystack.co/refund?reference=${encodeURIComponent(refundReference)}`,
		{
			headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
		},
	);

	const result = (await response.json()) as PaystackResult<RefundDataResponse>;

	if (!response.ok || result?.status !== true) {
		throw new Error(result?.message || "Could not check refund status");
	}

	return Array.isArray(result.data) ? (result.data[0] ?? null) : null;
};

export default verifyPaystackRefund;

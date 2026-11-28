// Paystack's JSON response envelope.
// An unsuccessful response may omit data.
export type PaystackResult<T> = {
	status: true;
	message: string;
	data: T;
};

// export type PaystackSuccess<T> = Extract<PaystackResult<T>, { status: true }>;

// `response` is Fetch's HTTP response.
// `result` is the parsed Paystack JSON body.
export type PaystackResponse<T> = {
	response: Response;
	result: PaystackResult<T>;
};

// Payment
export type InitializePaymentRequest = {
	amountInNaira: number;
	email: string;
	orderId: string;
	reference: string;
};

export type ResultDataResponse = {
	authorization_url: string;
	access_code: string;
	reference: string;
};

// Refund
export type RefundStatus =
	| "pending"
	| "processing"
	| "needs-attention"
	| "processed"
	| "failed";

export type RefundRequest = {
	paidAttemptReference: string;
	refundReference: string;
};

export type RefundDataResponse = {
	id: number;
	reference: string;
	status: RefundStatus;
	amount: number;
	currency: string;
	transaction: number | string;
	transaction_reference?: string;
};

// Verify
export type VerifyPaymentDataResult = {
	status:
		| "success"
		| "failed"
		| "abandoned"
		| "pending"
		| "ongoing"
		| "processing";
	reference: string;
	amount: number;
	currency: string;
	metadata?: {
		orderId?: string;
	};
	gateway_response?: string;
};

// paystack Refund Event
export type PaystackRefundEvent = {
	event?: string;
	data?: {
		status?: string;
		refund_reference?: string | null;
		transaction_reference?: string;
	};
};

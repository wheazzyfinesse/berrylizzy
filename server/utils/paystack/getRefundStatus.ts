const getRefundStatus = (event: string): string | null => {
	switch (event) {
		case "refund.pending":
			return "pending";
		case "refund.processing":
			return "processing";
		case "refund.needs-attention":
			return "needs-attention";
		case "refund.failed":
			return "failed";
		case "refund.processed":
			return "processed";
		default:
			return null;
	}
};

export default getRefundStatus;

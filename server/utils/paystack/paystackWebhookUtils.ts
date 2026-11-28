import { createHmac, timingSafeEqual } from "node:crypto";

export const verifyCurrentSignature = (
	rawBody: Buffer,
	header: string,
	secret: string,
): boolean => {
	let timestamp: number | undefined;
	const signatures: string[] = [];

	for (const part of header.split(",")) {
		const separator = part.indexOf("=");
		if (separator < 0) continue;

		const key = part.slice(0, separator).trim();
		const value = part.slice(separator + 1).trim();

		if (key === "t") {
			if (!/^\d+$/.test(value)) return false;
			timestamp = Number(value);
		}

		if (key === "v1") {
			// Current format is key-id:hex-signature
			const colon = value.indexOf(":");
			if (colon >= 0) signatures.push(value.slice(colon + 1));
		}
	}

	if (timestamp === undefined || signatures.length === 0) return false;

	// Reject signatures older or newer than five minutes.
	if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) {
		return false;
	}

	const expected = createHmac("sha512", secret)
		.update(`${timestamp}.`)
		.update(rawBody)
		.digest();

	return signatures.some((signature) => {
		if (!/^[0-9a-f]{128}$/.test(signature)) return false;

		const received = Buffer.from(signature, "hex");
		return (
			received.length === expected.length && timingSafeEqual(received, expected)
		);
	});
};

export const verifyLegacySignature = (
	rawBody: Buffer,
	signature: string,
	secret: string,
): boolean => {
	if (!/^[0-9a-f]{128}$/i.test(signature)) return false;

	const expected = createHmac("sha512", secret).update(rawBody).digest();
	const received = Buffer.from(signature, "hex");

	return (
		received.length === expected.length && timingSafeEqual(received, expected)
	);
};

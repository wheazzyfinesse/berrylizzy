import type { Request, Response } from "express";
export declare function initializePaystackPaymentCheckout({ amountInNaira, email, orderId, reference, }: {
    amountInNaira: number;
    email: string;
    orderId: string;
    reference?: string;
}): Promise<{
    authorization_url: string;
    reference: string;
}>;
export declare const verifyPaystackPaymentCallback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelMyOrderWithRefund: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=paystack.d.ts.map
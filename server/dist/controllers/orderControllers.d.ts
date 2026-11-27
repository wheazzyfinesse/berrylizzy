import type { Request, Response } from "express";
export declare function createPendingOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getOrders(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMyOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function releaseStock(order: any): Promise<void>;
export declare function releaseExpiredOrderReservations(): Promise<void>;
export declare const cancelMyOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=orderControllers.d.ts.map
import type { Request, Response } from "express";
export declare const getAddresses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAddressById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=addressControllers.d.ts.map
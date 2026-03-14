import { type Request, type Response } from 'express';
export declare const finalizeProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logAdvancePayout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAdvancePayout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAdvancePayout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAdvances: (req: Request, res: Response) => Promise<void>;
export declare const getProjectPredictions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPayouts: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=payoutController.d.ts.map
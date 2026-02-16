import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
export declare const getPartners: (req: Request, res: Response) => Promise<void>;
export declare const getPartnerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePartner: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePartner: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPartner: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=partnerController.d.ts.map
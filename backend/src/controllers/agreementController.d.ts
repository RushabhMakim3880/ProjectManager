import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
export declare const getCurrentAgreement: (req: Request, res: Response) => Promise<void>;
export declare const createAgreementVersion: (req: Request, res: Response) => Promise<void>;
export declare const signAgreement: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=agreementController.d.ts.map
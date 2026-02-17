import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
export declare const getTransactions: (req: Request, res: Response) => Promise<void>;
export declare const createTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTransaction: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=transactionController.d.ts.map
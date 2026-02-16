import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
export declare const createInvitation: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const acceptInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInvitations: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=invitationController.d.ts.map
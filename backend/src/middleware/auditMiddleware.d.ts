import { type Response, type NextFunction } from 'express';
import { type AuthRequest } from './authMiddleware.js';
export declare const logAction: (action: string, entity: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auditMiddleware.d.ts.map
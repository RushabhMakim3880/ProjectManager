import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from './authMiddleware.js';

export const logAction = (action: string, entity: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                prisma.auditLog.create({
                    data: {
                        userId: req.user.userId,
                        action,
                        entity,
                        entityId: req.params.id || body.id,
                        details: req.body,
                    }
                }).catch((err: Error) => console.error('Audit log error:', err));
            }
            return originalJson.call(this, body);
        };
        next();
    };
};

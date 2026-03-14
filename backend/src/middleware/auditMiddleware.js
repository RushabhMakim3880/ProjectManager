import {} from 'express';
import { prisma } from '../lib/prisma.js';
import {} from './authMiddleware.js';
export const logAction = (action, entity) => {
    return async (req, res, next) => {
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
                }).catch((err) => console.error('Audit log error:', err));
            }
            return originalJson.call(this, body);
        };
        next();
    };
};
//# sourceMappingURL=auditMiddleware.js.map
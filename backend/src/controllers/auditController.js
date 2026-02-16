import {} from 'express';
import { prisma } from '../index.js';
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Audit logs fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=auditController.js.map
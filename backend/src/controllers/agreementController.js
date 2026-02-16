import {} from 'express';
import { prisma } from '../index.js';
import {} from '../middleware/authMiddleware.js';
export const getCurrentAgreement = async (req, res) => {
    try {
        const agreement = await prisma.agreementVersion.findFirst({
            where: { isCurrent: true },
        });
        res.json(agreement);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const createAgreementVersion = async (req, res) => {
    const { content } = req.body;
    try {
        // Mark old as not current
        await prisma.agreementVersion.updateMany({
            data: { isCurrent: false },
        });
        const agreement = await prisma.agreementVersion.create({
            data: {
                content,
                isCurrent: true,
                version: (await prisma.agreementVersion.count()) + 1,
            },
        });
        res.status(201).json(agreement);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=agreementController.js.map
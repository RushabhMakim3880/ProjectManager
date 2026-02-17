import {} from 'express';
import { prisma } from '../lib/prisma.js';
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
export const signAgreement = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const partner = await prisma.partner.findUnique({
            where: { userId }
        });
        if (!partner)
            return res.status(403).json({ error: 'Only partners can sign agreements' });
        const agreement = await prisma.agreementVersion.findFirst({
            where: { isCurrent: true },
        });
        if (!agreement)
            return res.status(404).json({ error: 'No active agreement found' });
        await prisma.partner.update({
            where: { id: partner.id },
            data: {
                agreementAccepted: true,
                dateAccepted: new Date(),
                agreementVersionId: agreement.id,
                digitalSignature: `SIG-${partner.id}-${Date.now()}`
            }
        });
        res.json({ success: true, message: 'Agreement signed successfully' });
    }
    catch (error) {
        console.error('Sign agreement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=agreementController.js.map
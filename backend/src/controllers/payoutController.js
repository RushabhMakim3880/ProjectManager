import {} from 'express';
import { prisma } from '../index.js';
import { calculateProjectContributions, calculateFinancials } from '../services/contributionService.js';
export const finalizeProject = async (req, res) => {
    const { projectId } = req.params;
    if (!projectId)
        return res.status(400).json({ error: 'Project ID required' });
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { contributions: true },
        });
        if (!project)
            return res.status(404).json({ error: 'Project not found' });
        if (project.isLocked)
            return res.status(400).json({ error: 'Project is already finalized' });
        // 1. Recalculate everything one last time
        const contributions = await calculateProjectContributions(projectId);
        const financials = await calculateFinancials(projectId);
        // 2. Lock the project
        await prisma.project.update({
            where: { id: projectId },
            data: { isLocked: true },
        });
        // 3. Generate Payouts
        const payoutData = Object.entries(contributions).map(([partnerId, percentage]) => {
            const performanceShare = financials.performancePool * (percentage / 100);
            // Assuming base pool is split equally among partners who contributed
            const baseShare = financials.basePool / Object.keys(contributions).length;
            return {
                projectId,
                partnerId,
                baseShare,
                performanceShare,
                totalPayout: baseShare + performanceShare,
            };
        });
        await prisma.payout.createMany({
            data: payoutData,
        });
        // 4. Update Partner total earnings
        for (const payout of payoutData) {
            await prisma.partner.update({
                where: { id: payout.partnerId },
                data: { totalEarnings: { increment: payout.totalPayout } },
            });
        }
        res.json({ message: 'Project finalized and payouts generated', payouts: payoutData });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=payoutController.js.map
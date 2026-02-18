import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { calculateProjectContributions, calculateFinancials } from '../services/contributionService.js';
import { notifyPayoutFinalized } from '../services/emailService.js';

export const finalizeProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId as string },
            include: { contributions: true },
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.isLocked) return res.status(400).json({ error: 'Project is already finalized' });

        // 1. Recalculate everything one last time
        const contributions = await calculateProjectContributions(projectId as string);
        const financials = await calculateFinancials(projectId as string);

        // 2. Lock the project
        await prisma.project.update({
            where: { id: projectId },
            data: { isLocked: true },
        });

        // 3. Generate Payouts — base share uses ALL partners, not just contributors
        const totalPartnerCount = await prisma.partner.count();
        const payoutData = Object.entries(contributions).map(([partnerId, percentage]) => {
            const performanceShare = financials.performancePool * (percentage / 100);
            const baseShare = financials.basePool / totalPartnerCount;

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

        // Fire-and-forget email notification to all partners
        notifyPayoutFinalized(project, payoutData.map(p => ({
            ...p,
            amount: p.totalPayout
        }))).catch(() => { });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPayouts = async (req: Request, res: Response) => {
    try {
        const payouts = await prisma.payout.findMany({
            include: {
                project: {
                    select: { name: true }
                },
                partner: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

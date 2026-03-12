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
            include: { contributions: true, advances: true },
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.status === 'COMPLETED' || project.isLocked) return res.status(400).json({ error: 'Project is already finalized or completed' });

        // 1. Recalculate everything one last time
        const contributions = await calculateProjectContributions(projectId as string);
        const financials = await calculateFinancials(projectId as string);

        // 2. Lock the project and mark it as COMPLETED
        await prisma.project.update({
            where: { id: projectId },
            data: { 
                isLocked: true,
                status: 'COMPLETED',
                closedAt: new Date()
            },
        });

        // 3. Generate Payouts — base share uses ALL partners, not just contributors
        const totalPartnerCount = await prisma.partner.count({ where: { user: { isActive: true } } });
        
        // Sum up advances per partner
        const advancesByPartner: Record<string, number> = {};
        if (project.advances) {
            project.advances.forEach((adv: any) => {
                advancesByPartner[adv.partnerId] = (advancesByPartner[adv.partnerId] || 0) + adv.amount;
            });
        }

        const payoutMap: Record<string, any> = {};

        // 3.1 Process effort-based contributions
        for (const [partnerId, percentage] of Object.entries(contributions)) {
            const performanceShare = financials.performancePool * ((percentage as number) / 100);
            const baseShare = financials.basePool / (totalPartnerCount || 1);
            
            payoutMap[partnerId] = {
                projectId,
                partnerId,
                baseShare,
                performanceShare,
                fixedCommission: 0,
                advanceDeduction: advancesByPartner[partnerId] || 0,
            };
        }

        // 3.2 Add fixed sales commission
        if (project.salesPartnerId && project.salesCommissionAmount) {
            if (!payoutMap[project.salesPartnerId]) {
                const baseShare = financials.basePool / (totalPartnerCount || 1);
                payoutMap[project.salesPartnerId] = {
                    projectId,
                    partnerId: project.salesPartnerId,
                    baseShare,
                    performanceShare: 0,
                    fixedCommission: 0,
                    advanceDeduction: advancesByPartner[project.salesPartnerId] || 0,
                };
            }
            payoutMap[project.salesPartnerId].fixedCommission = project.salesCommissionAmount;
        }

        const payoutData = Object.values(payoutMap).map(p => {
            const grossPayout = p.baseShare + p.performanceShare + p.fixedCommission;
            const netPayout = grossPayout - p.advanceDeduction;
            return {
                ...p,
                totalPayout: netPayout,
            };
        });

        await prisma.payout.createMany({
            data: payoutData,
        });

        // 4. Update Partner total earnings (Gross Payout)
        for (const payout of payoutData) {
            await prisma.partner.update({
                where: { id: payout.partnerId },
                data: { totalEarnings: { increment: payout.baseShare + payout.performanceShare + payout.fixedCommission } },
            });
        }

        res.json({ message: 'Project finalized and payouts generated, adjusting for advances.', payouts: payoutData });

        // Fire-and-forget email notification to all partners
        notifyPayoutFinalized(project, payoutData.map(p => ({
            ...p,
            amount: p.totalPayout
        }))).catch(() => { });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logAdvancePayout = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { partnerId, amount, method, referenceId, notes } = req.body;
    // req.user exists from authenticate middleware
    const recordedById = (req as any).user?.userId;

    if (!projectId || !partnerId || !amount || !method) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.status === 'COMPLETED' || project.isLocked) {
             return res.status(400).json({ error: 'Cannot add advances to a finalized project' });
        }

        const advance = await prisma.advancePayout.create({
            data: {
                projectId,
                partnerId,
                amount: Number(amount),
                method,
                referenceId,
                notes,
                recordedById
            }
        });

        res.status(201).json({ message: 'Advance payment recorded', advance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error recording advance' });
    }
};

export const updateAdvancePayout = async (req: Request, res: Response) => {
    const { projectId, advanceId } = req.params;
    const { amount, method, notes } = req.body;

    if (!amount || !method) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.status === 'COMPLETED' || project.isLocked) {
             return res.status(400).json({ error: 'Cannot modify advances of a finalized project' });
        }

        const advance = await prisma.advancePayout.update({
            where: { id: advanceId },
            data: {
                amount: Number(amount),
                method,
                notes
            }
        });

        res.json({ message: 'Advance payment updated', advance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating advance' });
    }
};

export const deleteAdvancePayout = async (req: Request, res: Response) => {
    const { projectId, advanceId } = req.params;

    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.status === 'COMPLETED' || project.isLocked) {
             return res.status(400).json({ error: 'Cannot delete advances of a finalized project' });
        }

        await prisma.advancePayout.delete({
            where: { id: advanceId }
        });

        res.json({ message: 'Advance payment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting advance' });
    }
};

export const getAdvances = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const advances = await prisma.advancePayout.findMany({
            where: { projectId },
            include: {
                partner: { include: { user: { select: { name: true } } } },
                recordedBy: { select: { name: true } }
            },
            orderBy: { paymentDate: 'desc' }
        });
        res.json(advances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching advances' });
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

import { prisma } from '../lib/prisma.js';

export const calculateProjectContributions = async (projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: true },
    });

    if (!project) throw new Error('Project not found');

    const tasks = project.tasks;

    let totalDoneEffort = 0;
    const partnerEffort: Record<string, number> = {};

    // 1. Calculate each partner's total done effort points
    tasks.forEach((task: any) => {
        if (task.status !== 'DONE') return;

        // Credit goes exclusively to the originally assigned partner
        const creditPartnerId = task.assignedPartnerId;
        
        if (creditPartnerId) {
            if (!partnerEffort[creditPartnerId]) {
                partnerEffort[creditPartnerId] = 0;
            }
            partnerEffort[creditPartnerId] += task.effortWeight;
            totalDoneEffort += task.effortWeight;
        }
    });

    // 2. Calculate contributions per partner
    const partnerContributions: Record<string, number> = {};

    // Ensure all assigned partners show up even with 0% (if they have tasks, but none done)
    const allAssignedIds = Array.from(new Set(tasks.map((t: any) => t.assignedPartnerId).filter(Boolean))) as string[];
    
    // Also ensure people who already have contributions in the DB are present
    const existingContributions = await prisma.contribution.findMany({ where: { projectId } });
    const existingIds = existingContributions.map((c: any) => c.partnerId);

    const allRelevantIds = Array.from(new Set([...allAssignedIds, ...existingIds]));
    
    allRelevantIds.forEach(id => {
        partnerContributions[id] = 0;
    });

    if (totalDoneEffort > 0) {
        for (const partnerId in partnerEffort) {
            const effort = partnerEffort[partnerId] || 0;
            const share = (effort / totalDoneEffort) * 100;
            partnerContributions[partnerId] = Number(share.toFixed(2));
        }
    } else if (allRelevantIds.length > 0) {
        // If no effort yet, distribute equally across all active project participants
        const equalShare = Number((100 / allRelevantIds.length).toFixed(2));
        allRelevantIds.forEach(id => {
            partnerContributions[id] = equalShare;
        });
    }

    // 2.1 Final check to handle rounding errors and ensure exactly 100%
    const finalTotal = Object.values(partnerContributions).reduce((a, b) => a + b, 0);
    if (finalTotal > 0 && finalTotal !== 100) {
        // Give the rounding diff to the first partner who has > 0, or just the first partner
        const activeIds = Object.keys(partnerContributions).filter(id => (partnerContributions[id] || 0) > 0);
        const targetId = activeIds.length > 0 ? activeIds[0] : allRelevantIds[0];
        if (targetId) {
            partnerContributions[targetId] = Number(((partnerContributions[targetId] || 0) + (100 - finalTotal)).toFixed(2));
        }
    }

    // 3. Update database
    await prisma.$transaction(async (tx: any) => {
        // Clear old contributions
        await tx.contribution.deleteMany({ where: { projectId } });

        // Create new entries
        const createData = Object.entries(partnerContributions).map(([partnerId, percentage]) => ({
            projectId,
            partnerId,
            percentage,
        }));

        if (createData.length > 0) {
            await tx.contribution.createMany({ data: createData });
        }
    });

    return partnerContributions;
};

export const calculateFinancials = async (projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { transactions: true }
    });

    if (!project) throw new Error('Project not found');

    // Calculate actual funds received vs spent
    const transactions = project.transactions || [];
    const totalIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const actualBalance = totalIncome - totalExpenses;

    // Profit Calculation Logic:
    // We take the actual balance and apply the 85/10/5 split.
    // This ensures partners are paid from REALIZED profit.
    const businessReserve = actualBalance * 0.10;
    const religiousAllocation = actualBalance * 0.05;
    const netDistributable = actualBalance - businessReserve - religiousAllocation;

    const basePool = netDistributable * 0.20;
    const performancePool = netDistributable * 0.80;

    // Update project netProfit
    await prisma.project.update({
        where: { id: projectId },
        data: { netProfit: netDistributable },
    });

    // Create or update financial record
    // We'll use upsert if possible, or just create a new one as a snapshot
    const financial = await prisma.financial.create({
        data: {
            projectId,
            businessReserve,
            religiousAllocation,
            netDistributable,
            basePool,
            performancePool,
        },
    });

    return {
        ...financial,
        totalIncome,
        totalExpenses,
        actualBalance
    };
};

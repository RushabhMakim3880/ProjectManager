import { prisma } from '../index.js';

export const calculateProjectContributions = async (projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: true },
    });

    if (!project) throw new Error('Project not found');

    const weights = project.weights as Record<string, number>;
    const tasks = project.tasks;

    // 1. Group tasks by category and calculate total effort per category
    const categoryData: Record<string, { totalEffort: number, partnerEffort: Record<string, number> }> = {};

    tasks.forEach((task: any) => {
        if (!categoryData[task.category]) {
            categoryData[task.category] = { totalEffort: 0, partnerEffort: {} };
        }

        const cat = categoryData[task.category]!;
        cat.totalEffort += task.effortWeight;

        if (task.assignedPartnerId) {
            if (!cat.partnerEffort[task.assignedPartnerId]) {
                cat.partnerEffort[task.assignedPartnerId] = 0;
            }
            cat.partnerEffort[task.assignedPartnerId]! += task.effortWeight;
        }
    });

    // 2. Calculate contributions per partner
    const partnerContributions: Record<string, number> = {};

    for (const category in categoryData) {
        const data = categoryData[category]!;
        const { totalEffort, partnerEffort } = data;
        const categoryWeight = weights[category] || 0;

        if (totalEffort > 0) {
            for (const partnerId in partnerEffort) {
                const effort = partnerEffort[partnerId]!;
                const share = effort / totalEffort;
                const contribution = share * categoryWeight;

                partnerContributions[partnerId] = (partnerContributions[partnerId] || 0) + contribution;
            }
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

        await tx.contribution.createMany({ data: createData });
    });

    return partnerContributions;
};

export const calculateFinancials = async (projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');

    const totalValue = project.totalValue;
    const businessReserve = totalValue * 0.10;
    const religiousAllocation = totalValue * 0.05;
    const netDistributable = totalValue - businessReserve - religiousAllocation;

    const basePool = netDistributable * 0.20;
    const performancePool = netDistributable * 0.80;

    // Update project netProfit
    await prisma.project.update({
        where: { id: projectId },
        data: { netProfit: netDistributable },
    });

    // Create or update financial record
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

    return financial;
};

import { prisma } from '../lib/prisma.js';
export const calculateProjectContributions = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: true },
    });
    if (!project)
        throw new Error('Project not found');
    const weights = typeof project.weights === 'string'
        ? JSON.parse(project.weights)
        : project.weights;
    const tasks = project.tasks;
    // 1. Group tasks by category and calculate total effort per category
    const categoryData = {};
    // Fetch all partners for this project to map userId to partnerId
    const projectPartners = await prisma.partner.findMany({
        where: { contributions: { some: { projectId } } }
    });
    const userToPartnerMap = {};
    projectPartners.forEach((p) => {
        userToPartnerMap[p.userId] = p.id;
    });
    tasks.forEach((task) => {
        if (!categoryData[task.category]) {
            categoryData[task.category] = { totalEffort: 0, partnerEffort: {} };
        }
        const cat = categoryData[task.category];
        cat.totalEffort += task.effortWeight;
        // Credit goes to COMPLETER if task is DONE, otherwise to ASSIGNEE
        let creditPartnerId = task.assignedPartnerId;
        if (task.status === 'DONE' && task.completedById) {
            // Map the User ID (completer) to a Partner ID
            creditPartnerId = userToPartnerMap[task.completedById] || task.assignedPartnerId;
        }
        if (creditPartnerId) {
            if (!cat.partnerEffort[creditPartnerId]) {
                cat.partnerEffort[creditPartnerId] = 0;
            }
            cat.partnerEffort[creditPartnerId] += task.effortWeight;
        }
    });
    // 2. Calculate contributions per partner
    const partnerContributions = {};
    // Ensure all leads are in the list at minimum (0%)
    const leadIds = [
        project.projectLeadId,
        project.techLeadId,
        project.commsLeadId,
        project.qaLeadId,
        project.salesOwnerId
    ].filter(id => id && id.trim() !== "");
    leadIds.forEach(id => {
        if (!partnerContributions[id])
            partnerContributions[id] = 0;
    });
    for (const category in categoryData) {
        const data = categoryData[category];
        const { totalEffort, partnerEffort } = data;
        const categoryWeight = weights[category] || 0;
        if (totalEffort > 0) {
            for (const partnerId in partnerEffort) {
                const effort = partnerEffort[partnerId];
                const share = effort / totalEffort;
                const contribution = share * categoryWeight;
                partnerContributions[partnerId] = (partnerContributions[partnerId] || 0) + contribution;
            }
        }
    }
    // 2.1 Normalize total to 100%
    const totalRaw = Object.values(partnerContributions).reduce((a, b) => a + b, 0);
    if (totalRaw > 0) {
        for (const pid in partnerContributions) {
            partnerContributions[pid] = Number(((partnerContributions[pid] / totalRaw) * 100).toFixed(2));
        }
    }
    else if (leadIds.length > 0) {
        // If no effort yet, distribute equally among leads to maintain 100% total
        const equalShare = Number((100 / leadIds.length).toFixed(2));
        leadIds.forEach(id => {
            partnerContributions[id] = equalShare;
        });
    }
    // Final check to handle rounding errors and ensure exactly 100%
    const finalTotal = Object.values(partnerContributions).reduce((a, b) => a + b, 0);
    if (finalTotal > 0 && finalTotal !== 100) {
        const firstId = Object.keys(partnerContributions)[0];
        partnerContributions[firstId] = Number((partnerContributions[firstId] + (100 - finalTotal)).toFixed(2));
    }
    // 3. Update database
    await prisma.$transaction(async (tx) => {
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
export const calculateFinancials = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { transactions: true }
    });
    if (!project)
        throw new Error('Project not found');
    // Calculate actual funds received vs spent
    const transactions = project.transactions || [];
    const totalIncome = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
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
//# sourceMappingURL=contributionService.js.map
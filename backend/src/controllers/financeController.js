import { prisma } from '../lib/prisma.js';
// Get Company-Wide Financial Summary
export const getCompanySummary = async (req, res) => {
    try {
        // 1. Aggregated Income & Expenses from Transactions
        const transactions = await prisma.transaction.findMany({
            select: {
                type: true,
                amount: true
            }
        });
        const totalRevenue = transactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        // 2. Aggregated Project Stats
        const projects = await prisma.project.findMany({
            select: {
                totalValue: true,
                status: true
            }
        });
        const totalProjectValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
        const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
        const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
        // 3. Partner Equity Distribution
        const partners = await prisma.partner.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        const equityDistribution = partners.map((p) => ({
            id: p.id,
            name: p.user.name,
            equity: p.equityPercentage,
            totalContributed: p.totalCapitalContributed
        }));
        res.json({
            financials: {
                totalRevenue,
                totalExpenses,
                netProfit,
                totalProjectValue
            },
            projects: {
                total: projects.length,
                active: activeProjects,
                completed: completedProjects
            },
            equity: equityDistribution
        });
    }
    catch (error) {
        console.error('Error fetching company summary:', error);
        res.status(500).json({ error: 'Failed to fetch company summary' });
    }
};
// Inject Capital & Recalculate Equity
export const injectCapital = async (req, res) => {
    const { partnerId, amount, notes } = req.body;
    if (!partnerId || !amount || amount <= 0) {
        res.status(400).json({ error: 'Invalid partner or amount' });
        return;
    }
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update Partner's Total Contribution
            const partner = await tx.partner.update({
                where: { id: partnerId },
                data: {
                    totalCapitalContributed: {
                        increment: parseFloat(amount)
                    }
                }
            });
            // 2. Fetch ALL partners to recalculate equity
            const allPartners = await tx.partner.findMany();
            const totalCapital = allPartners.reduce((sum, p) => sum + p.totalCapitalContributed, 0);
            // 3. Recalculate and Update Equity for ALL partners
            if (totalCapital > 0) {
                for (const p of allPartners) {
                    // Precision handling: (Contribution / Total) * 100
                    // Example: (5000 / 100000) * 100 = 5%
                    const newEquity = (p.totalCapitalContributed / totalCapital) * 100;
                    await tx.partner.update({
                        where: { id: p.id },
                        data: { equityPercentage: newEquity }
                    });
                }
            }
            // 4. Create Capital Injection Record
            const finalInjectingPartner = await tx.partner.findUniqueOrThrow({ where: { id: partnerId } });
            await tx.capitalInjection.create({
                data: {
                    partnerId,
                    amount: parseFloat(amount),
                    equityDelta: finalInjectingPartner.equityPercentage - (partner.equityPercentage || 0), // Approx delta based on previous state
                    postEquity: finalInjectingPartner.equityPercentage,
                    notes
                }
            });
        });
        res.json({ message: 'Capital injected and equity recalculated successfully' });
    }
    catch (error) {
        console.error('Error injecting capital:', error);
        res.status(500).json({ error: 'Failed to inject capital' });
    }
};
//# sourceMappingURL=financeController.js.map
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';
export const getAgencyStats = async (req, res, next) => {
    try {
        const totalRevenue = await prisma.project.aggregate({
            _sum: { totalValue: true }
        });
        const activeProjects = await prisma.project.count({
            where: { status: 'ACTIVE' }
        });
        const completedProjectsCount = await prisma.project.count({
            where: { status: 'COMPLETED' }
        });
        const totalEnquiries = await prisma.enquiry.count();
        const convertedEnquiries = await prisma.enquiry.count({
            where: { projectId: { not: null } }
        });
        // Revenue Over Time (Last 12 Months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        const projectGrowth = await prisma.project.findMany({
            where: { createdAt: { gte: twelveMonthsAgo } },
            select: { createdAt: true, totalValue: true }
        });
        // Aggregate by month
        const monthlyGrowth = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            const monthYear = `${monthLabel} ${date.getFullYear()}`;
            const monthTotal = projectGrowth
                .filter((p) => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
            })
                .reduce((sum, p) => sum + (p.totalValue || 0), 0);
            return { month: monthYear, total: monthTotal };
        });
        res.json({
            revenue: totalRevenue._sum.totalValue || 0,
            activeProjects,
            completedProjects: completedProjectsCount,
            conversionRate: totalEnquiries > 0 ? (convertedEnquiries / totalEnquiries) * 100 : 0,
            growth: monthlyGrowth
        });
    }
    catch (error) {
        next(error);
    }
};
export const getPartnerPerformance = async (req, res, next) => {
    try {
        const partners = await prisma.partner.findMany({
            include: {
                user: { select: { name: true, displayName: true } },
                contributions: {
                    include: { project: { select: { id: true, name: true, totalValue: true, status: true } } }
                },
                tasks: {
                    where: { status: 'DONE' }
                },
                payouts: true
            }
        });
        const performanceData = partners.map((p) => {
            const totalTasks = p.tasks.length;
            // Calculate Accrued Earnings: Summary of (Project Total * Contribution % * 0.8)
            // 0.8 because 10% is business reserve and 10% is Sharmadiya Seth (Total 20% deduction)
            const accruedEarnings = p.contributions.reduce((sum, c) => {
                const projectValue = c.project.totalValue || 0;
                const share = (projectValue * (c.percentage / 100)) * 0.8;
                return sum + share;
            }, 0);
            const paidEarnings = p.payouts.reduce((sum, pay) => sum + pay.totalPayout, 0);
            const totalEarnings = Math.max(accruedEarnings, paidEarnings); // Fallback to payouts if higher
            const activeProjectCount = p.contributions.filter((c) => c.project.status === 'ACTIVE').length;
            return {
                id: p.id,
                name: p.user.displayName || p.user.name,
                totalEarnings,
                accruedEarnings,
                paidEarnings,
                taskCount: totalTasks,
                activeProjects: activeProjectCount,
                skills: p.skills ? p.skills.split(',') : []
            };
        });
        res.json(performanceData);
    }
    catch (error) {
        next(error);
    }
};
export const getCashflowData = async (req, res, next) => {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: 'asc' },
            select: { amount: true, date: true, type: true }
        });
        res.json(transactions);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=analyticsController.js.map
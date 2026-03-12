import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getAgencyStats = async (req: Request, res: Response, next: NextFunction) => {
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

        // Revenue Over Time (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const projectGrowth = await prisma.project.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true, totalValue: true }
        });

        res.json({
            revenue: totalRevenue._sum.totalValue || 0,
            activeProjects,
            completedProjects: completedProjectsCount,
            conversionRate: totalEnquiries > 0 ? (convertedEnquiries / totalEnquiries) * 100 : 0,
            growth: projectGrowth
        });
    } catch (error) {
        next(error);
    }
};

export const getPartnerPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partners = await prisma.partner.findMany({
            include: {
                user: { select: { name: true, displayName: true } },
                contributions: {
                    include: { project: { select: { name: true, totalValue: true, status: true } } }
                },
                tasks: {
                    where: { status: 'DONE' }
                },
                payouts: true
            }
        });

        const performanceData = partners.map((p: any) => {
            const totalTasks = p.tasks.length;
            const totalEarnings = p.payouts.reduce((sum: number, pay: any) => sum + pay.totalPayout, 0);
            const activeProjectCount = p.contributions.filter((c: any) => c.project.status === 'ACTIVE').length;

            return {
                id: p.id,
                name: p.user.displayName || p.user.name,
                totalEarnings,
                taskCount: totalTasks,
                activeProjects: activeProjectCount,
                skills: p.skills ? p.skills.split(',') : []
            };
        });

        res.json(performanceData);
    } catch (error) {
        next(error);
    }
};

export const getCashflowData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: 'asc' },
            select: { amount: true, date: true, type: true }
        });

        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

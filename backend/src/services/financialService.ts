import { prisma } from '../lib/prisma.js';

export interface FinancialMetrics {
    totalValue: number;
    actualBalance: number;
    businessReserve: number;
    religiousAllocation: number;
    netDistributable: number;
    basePool: number;
    performancePool: number;
}

export class FinancialService {
    /**
     * Calculates all pools and allocations for a project based on its balance.
     */
    static calculateMetrics(totalValue: number, actualBalance: number): FinancialMetrics {
        // Business Reserve (10%)
        const businessReserve = actualBalance * 0.10;

        // Religious/Charity Allocation (5%)
        const religiousAllocation = actualBalance * 0.05;

        // Net Distributable (85% of balance)
        const netDistributable = actualBalance - (businessReserve + religiousAllocation);

        // Base Pool (20% of net) - Distributed equally or by base weights
        const basePool = netDistributable * 0.20;

        // Performance Pool (80% of net) - Distributed by project weights/performance
        const performancePool = netDistributable * 0.80;

        return {
            totalValue,
            actualBalance,
            businessReserve,
            religiousAllocation,
            netDistributable,
            basePool,
            performancePool
        };
    }

    /**
     * Recalculates and saves financial records for a project.
     */
    static async recalculateProjectFinancials(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { transactions: true }
        });

        if (!project) throw new Error('Project not found');

        // Calculate actual balance from ledger
        const actualBalance = project.transactions.reduce((acc: number, t: any) => {
            return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
        }, 0);

        const metrics = this.calculateMetrics(project.totalValue, actualBalance);

        // Update or create financial record
        return await prisma.financial.upsert({
            where: { projectId },
            update: {
                totalValue: metrics.totalValue,
                actualBalance: metrics.actualBalance,
                businessReserve: metrics.businessReserve,
                religiousAllocation: metrics.religiousAllocation,
                netDistributable: metrics.netDistributable,
                basePool: metrics.basePool,
                performancePool: metrics.performancePool,
            },
            create: {
                projectId,
                totalValue: metrics.totalValue,
                actualBalance: metrics.actualBalance,
                businessReserve: metrics.businessReserve,
                religiousAllocation: metrics.religiousAllocation,
                netDistributable: metrics.netDistributable,
                basePool: metrics.basePool,
                performancePool: metrics.performancePool,
            }
        });
    }

    /**
     * Calculates partner earnings based on contributions and performance pool.
     */
    static calculatePartnerEarnings(performancePool: number, contributionPercentage: number): number {
        return (contributionPercentage / 100) * performancePool;
    }
}

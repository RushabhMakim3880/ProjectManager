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
    private static readonly BUSINESS_RESERVE_PERCENT = 0.10;
    private static readonly RELIGIOUS_PERCENT = 0.05;
    private static readonly BASE_POOL_PERCENT = 0.20;
    private static readonly PERFORMANCE_POOL_PERCENT = 0.80;

    /**
     * Deterministic profit-sharing calculation module.
     * Computes exact payouts based on revenue and contribution percentages.
     */
    static calculateProfitSharing(GPR: number, partners: { id?: string; name: string; contributionPercent: number }[]) {
        // VALIDATION
        if (GPR < 0) throw new Error('GPR must be >= 0');
        if (partners.length === 0) throw new Error('At least one partner must exist');

        const totalContribution = partners.reduce((sum, p) => sum + p.contributionPercent, 0);
        // Using a small epsilon for float comparison if needed, but here we expect strictly 100
        if (Math.abs(totalContribution - 100) > 0.1) {
            throw new Error(`Sum of contributionPercent must equal 100. Current total: ${totalContribution}%`);
        }

        // STEP 1 — RESERVE CALCULATION
        const businessReserve = Number((GPR * this.BUSINESS_RESERVE_PERCENT).toFixed(2));
        const religiousAllocation = Number((GPR * this.RELIGIOUS_PERCENT).toFixed(2));
        const NDP = Number((GPR - (businessReserve + religiousAllocation)).toFixed(2));

        // STEP 2 — SPLIT INTO POOLS
        const basePool = Number((NDP * this.BASE_POOL_PERCENT).toFixed(2));
        const performancePool = Number((NDP * this.PERFORMANCE_POOL_PERCENT).toFixed(2));

        // STEP 3 — BASE SHARE PER PARTNER
        const baseShareEach = Number((basePool / partners.length).toFixed(2));

        // STEP 4 & 5 — PERFORMANCE SHARE & FINAL PAYOUT
        const partnerResults = partners.map(partner => {
            const performanceShare = Number((performancePool * (partner.contributionPercent / 100)).toFixed(2));
            const finalPayout = Number((baseShareEach + performanceShare).toFixed(2));

            return {
                ...partner,
                baseShare: baseShareEach,
                performanceShare,
                finalPayout
            };
        });

        // STEP 6 — OUTPUT STRUCTURE
        return {
            businessReserve,
            religiousAllocation,
            NDP,
            basePool,
            performancePool,
            partners: partnerResults
        };
    }

    /**
     * Recalculates and saves financial records for a project.
     */
    static async recalculateProjectFinancials(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                transactions: true,
                contributions: {
                    include: { partner: { include: { user: true } } }
                }
            }
        });

        if (!project) throw new Error('Project not found');

        // Calculate actual balance (GPR) from ledger
        const GPR = project.transactions.reduce((acc: number, t: any) => {
            return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
        }, 0);

        // Prepare partners for deterministic module
        const partnersForCalc = project.contributions.map((c: any) => ({
            id: c.partnerId,
            name: c.partner.user.name,
            contributionPercent: c.percentage
        }));

        // If no contributions exist, we can't calculate profit sharing accurately
        if (partnersForCalc.length === 0) {
            return await prisma.financial.upsert({
                where: { projectId },
                update: { actualBalance: GPR, totalValue: project.totalValue },
                create: { projectId, actualBalance: GPR, totalValue: project.totalValue }
            });
        }

        const metrics = this.calculateProfitSharing(GPR, partnersForCalc);

        // Update or create financial record
        return await prisma.financial.upsert({
            where: { projectId },
            update: {
                totalValue: project.totalValue,
                actualBalance: GPR,
                businessReserve: metrics.businessReserve,
                religiousAllocation: metrics.religiousAllocation,
                netDistributable: metrics.NDP,
                basePool: metrics.basePool,
                performancePool: metrics.performancePool,
            },
            create: {
                projectId,
                totalValue: project.totalValue,
                actualBalance: GPR,
                businessReserve: metrics.businessReserve,
                religiousAllocation: metrics.religiousAllocation,
                netDistributable: metrics.NDP,
                basePool: metrics.basePool,
                performancePool: metrics.performancePool,
            }
        });
    }

    /**
     * Helper to get partner earnings based on dynamic performance pool.
     * Legacy helper - will be deprecated by the deterministic finalPayout.
     */
    static calculatePartnerEarnings(performancePool: number, contributionPercentage: number): number {
        return Number(((contributionPercentage / 100) * performancePool).toFixed(2));
    }
}

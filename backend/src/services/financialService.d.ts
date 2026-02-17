export interface FinancialMetrics {
    totalValue: number;
    actualBalance: number;
    businessReserve: number;
    religiousAllocation: number;
    netDistributable: number;
    basePool: number;
    performancePool: number;
}
export declare class FinancialService {
    private static readonly BUSINESS_RESERVE_PERCENT;
    private static readonly RELIGIOUS_PERCENT;
    private static readonly BASE_POOL_PERCENT;
    private static readonly PERFORMANCE_POOL_PERCENT;
    /**
     * Deterministic profit-sharing calculation module.
     * Computes exact payouts based on revenue and contribution percentages.
     */
    static calculateProfitSharing(GPR: number, partners: {
        id?: string;
        name: string;
        contributionPercent: number;
    }[]): {
        businessReserve: number;
        religiousAllocation: number;
        NDP: number;
        basePool: number;
        performancePool: number;
        partners: {
            baseShare: number;
            performanceShare: number;
            finalPayout: number;
            id?: string;
            name: string;
            contributionPercent: number;
        }[];
    };
    /**
     * Recalculates and saves financial records for a project.
     */
    static recalculateProjectFinancials(projectId: string): Promise<any>;
    /**
     * Helper to get partner earnings based on dynamic performance pool.
     * Legacy helper - will be deprecated by the deterministic finalPayout.
     */
    static calculatePartnerEarnings(performancePool: number, contributionPercentage: number): number;
}
//# sourceMappingURL=financialService.d.ts.map
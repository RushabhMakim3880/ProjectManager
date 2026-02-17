// Deterministic profit-sharing calculation module logic
const calculateProfitSharing = (GPR, partners) => {
    const BUSINESS_RESERVE_PERCENT = 0.10;
    const RELIGIOUS_PERCENT = 0.05;
    const BASE_POOL_PERCENT = 0.20;
    const PERFORMANCE_POOL_PERCENT = 0.80;

    // VALIDATION
    if (GPR < 0) throw new Error('GPR must be >= 0');
    if (partners.length === 0) throw new Error('At least one partner must exist');

    const totalContribution = partners.reduce((sum, p) => sum + p.contributionPercent, 0);
    if (Math.abs(totalContribution - 100) > 0.1) {
        throw new Error(`Sum of contributionPercent must equal 100. Current total: ${totalContribution}%`);
    }

    // STEP 1 — RESERVE CALCULATION
    const businessReserve = Number((GPR * BUSINESS_RESERVE_PERCENT).toFixed(2));
    const religiousAllocation = Number((GPR * RELIGIOUS_PERCENT).toFixed(2));
    const NDP = Number((GPR - (businessReserve + religiousAllocation)).toFixed(2));

    // STEP 2 — SPLIT INTO POOLS
    const basePool = Number((NDP * BASE_POOL_PERCENT).toFixed(2));
    const performancePool = Number((NDP * PERFORMANCE_POOL_PERCENT).toFixed(2));

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
};

// TEST CASE
const GPR = 24000;
const partners = [
    { name: "Akshat", contributionPercent: 70 },
    { name: "Rushabh", contributionPercent: 30 },
    { name: "Nishit", contributionPercent: 0 }
];

console.log("--- PROFIT SHARING TEST CASE ---");
const result = calculateProfitSharing(GPR, partners);
console.log("Business Reserve (10%):", result.businessReserve);
console.log("Religious Allocation (5%):", result.religiousAllocation);
console.log("NDP (85%):", result.NDP);
console.log("Base Pool (20%):", result.basePool);
console.log("Performance Pool (80%):", result.performancePool);

console.log("\n--- PARTNER BREAKDOWN ---");
result.partners.forEach(p => {
    console.log(`${p.name}: Base=${p.baseShare}, Perf=${p.performanceShare}, Total=${p.finalPayout}`);
});

const totalPayouts = result.partners.reduce((sum, p) => sum + p.finalPayout, 0);
const totalSystem = Number((totalPayouts + result.businessReserve + result.religiousAllocation).toFixed(2));
console.log("\nTotal (Payouts + Reserves):", totalSystem);
console.log("Match:", totalSystem === GPR ? "✅" : "❌");

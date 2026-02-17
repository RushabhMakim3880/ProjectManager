import { FinancialService } from './backend/src/services/financialService.js';

const testCalculate = () => {
    const GPR = 24000;
    const partners = [
        { name: "Akshat", contributionPercent: 70 },
        { name: "Rushabh", contributionPercent: 30 },
        { name: "Nishit", contributionPercent: 0 }
    ];

    console.log("--- PROFIT SHARING TEST CASE ---");
    console.log("INPUT GPR:", GPR);
    console.log("INPUT PARTNERS:", partners);

    try {
        const result = FinancialService.calculateProfitSharing(GPR, partners);
        console.log("\n--- CALCULATION SUCCESS ---");
        console.log("Business Reserve (10%):", result.businessReserve);
        console.log("Religious Allocation (5%):", result.religiousAllocation);
        console.log("NDP (85%):", result.NDP);
        console.log("Base Pool (20% of NDP):", result.basePool);
        console.log("Performance Pool (80% of NDP):", result.performancePool);

        console.log("\n--- PARTNER BREAKDOWN ---");
        result.partners.forEach(p => {
            console.log(`\nPartner: ${p.name}`);
            console.log(`  Contribution: ${p.contributionPercent}%`);
            console.log(`  Base Share: ${p.baseShare}`);
            console.log(`  Performance Share: ${p.performanceShare}`);
            console.log(`  Final Payout: ${p.finalPayout}`);
        });

        const totalPayouts = result.partners.reduce((sum, p) => sum + p.finalPayout, 0);
        const totalSystem = totalPayouts + result.businessReserve + result.religiousAllocation;

        console.log("\n--- VALIDATION ---");
        console.log("Total Payouts + Reserves:", totalSystem);
        console.log("System Balance:", totalSystem === GPR ? "MATCHED ✅" : `MISMATCH ❌ (Diff: ${GPR - totalSystem})`);

    } catch (error) {
        console.error("CALCULATION FAILED:", error.message);
    }
};

testCalculate();

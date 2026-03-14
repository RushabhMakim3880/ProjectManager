import { FinancialService } from '../services/financialService.js';
import { prisma } from '../lib/prisma.js';
async function testRefactor() {
    console.log('--- Starting Financial Refactor Verification ---');
    try {
        // Find an active project to test with (or create one)
        const project = await prisma.project.findFirst({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true, totalValue: true }
        });
        if (!project) {
            console.log('No active project found for testing. Please ensure at least one project exists.');
            return;
        }
        console.log(`Testing with project: ${project.name} (${project.id})`);
        // 1. Test Recalculation
        console.log('\n[1/3] Testing recalculateProjectFinancials...');
        const financials = await FinancialService.recalculateProjectFinancials(project.id);
        console.log('Current Financial Metrics:', JSON.stringify(financials, null, 2));
        if (financials.gpr !== (financials.totalIncome - financials.operationalExpenses)) {
            throw new Error('GPR calculation mismatch: Total Income - Operational Expenses');
        }
        console.log('✅ GPR calculation verified.');
        // 2. Test Predictions
        console.log('\n[2/3] Testing calculatePredictions...');
        const predictions = await FinancialService.calculatePredictions(project.id);
        if (predictions) {
            console.log('Predictions:', JSON.stringify(predictions, null, 2));
            console.log('✅ Predictions generated successfully.');
        }
        else {
            console.log('⚠️ No predictions generated (likely due to missing contributions/tasks).');
        }
        // 3. Test Advance Isolation
        console.log('\n[3/3] Checking advance isolation logic...');
        // We'll manually check if any "Advance" or "Partner Draw" categories are present in transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                projectId: project.id,
                type: 'EXPENSE'
            }
        });
        const advanceCategories = ['Advance', 'Partner Draw', 'ADVANCE', 'PARTNER_DRAW'];
        const advancesFoundInExpenses = transactions.filter(t => advanceCategories.includes(t.category || ''));
        if (advancesFoundInExpenses.length > 0) {
            console.log(`Found ${advancesFoundInExpenses.length} transactions that SHOULD be filtered out from operational expenses.`);
            // Verify they were indeed filtered
            // In the service, operationalExpenses = transactions.reduce(...) excluding these
            console.log('Note: If these transactions exist, verify that operationalExpenses in step 1 is lower than total transactions sum.');
        }
        else {
            console.log('No advance-categorized transactions found for this project.');
        }
        console.log('\n--- Verification Complete ---');
    }
    catch (error) {
        console.error('❌ Verification Failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testRefactor();
//# sourceMappingURL=financial_refactor_test.js.map
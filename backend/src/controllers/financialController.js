import { calculateProjectContributions } from '../services/contributionService.js';
import { FinancialService } from '../services/financialService.js';
import { AppError } from '../middleware/errorMiddleware.js';
export const recalculateProject = async (req, res, next) => {
    const projectId = req.params.projectId;
    if (!projectId)
        return next(new AppError('Project ID required', 400));
    try {
        // 1. Recalculate partner contribution percentages based on task effort
        const contributions = await calculateProjectContributions(projectId);
        // 2. Recalculate financial pools based on ledger balance
        const financials = await FinancialService.recalculateProjectFinancials(projectId);
        res.json({ contributions, financials });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=financialController.js.map
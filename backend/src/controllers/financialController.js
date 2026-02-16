import {} from 'express';
import { calculateProjectContributions, calculateFinancials } from '../services/contributionService.js';
export const recalculateProject = async (req, res) => {
    const { projectId } = req.params;
    if (!projectId)
        return res.status(400).json({ error: 'Project ID required' });
    try {
        const contributions = await calculateProjectContributions(projectId);
        const financials = await calculateFinancials(projectId);
        res.json({ contributions, financials });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=financialController.js.map
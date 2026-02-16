import { type Request, type Response } from 'express';
import { calculateProjectContributions, calculateFinancials } from '../services/contributionService.js';

export const recalculateProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });
    try {
        const contributions = await calculateProjectContributions(projectId as string);
        const financials = await calculateFinancials(projectId as string);

        res.json({ contributions, financials });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

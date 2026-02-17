import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, name, category, effortWeight, assignedPartnerId } = req.body;
        const userId = req.user?.userId;

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partnerProfile: true }
        });

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const isAdmin = user.role === 'ADMIN';
        const canLogTasks = user.partnerProfile?.canLogTasks;

        if (!isAdmin && !canLogTasks) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to create tasks' });
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                name,
                category,
                effortWeight: effortWeight || 1.0,
                assignedPartnerId: assignedPartnerId || null,
            },
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { completionPercent, timeSpent } = req.body;

    try {
        const task = await prisma.task.update({
            where: { id },
            data: {
                completionPercent,
                timeSpent,
            },
            include: { project: true },
        });

        // Logic for auto-recalculation could be triggered here or via a dedicated service

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTasksByProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                assignedPartner: { include: { user: true } },
            },
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.task.delete({
            where: { id },
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

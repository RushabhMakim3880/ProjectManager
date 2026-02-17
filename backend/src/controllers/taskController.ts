import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { projectId, name, category, effortWeight, assignedPartnerId, status } = req.body;
        const userId = req.user?.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partnerProfile: true }
        });

        if (!user) return next(new AppError('Unauthorized', 401));

        const isAdmin = user.role === 'ADMIN';
        const canLogTasks = user.partnerProfile?.canLogTasks;

        if (!isAdmin && !canLogTasks) {
            return next(new AppError('Forbidden: You do not have permission to create tasks', 403));
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                name,
                category,
                effortWeight: effortWeight ? Number(effortWeight) : 1.0,
                assignedPartnerId: assignedPartnerId || null,
                status: status || 'BACKLOG',
                completionPercent: status === 'DONE' ? 100 : 0
            },
        });

        res.status(201).json(task);
    } catch (error: any) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { completionPercent, timeSpent, status, name, category, effortWeight, assignedPartnerId } = req.body;

    try {
        // Sync status and completionPercent
        let finalStatus = status;
        let finalPercent = completionPercent;

        if (status === 'DONE') {
            finalPercent = 100;
        } else if (completionPercent === 100 && !status) {
            finalStatus = 'DONE';
        } else if (completionPercent === 0 && !status) {
            finalStatus = 'BACKLOG';
        } else if (completionPercent > 0 && completionPercent < 100 && !status) {
            finalStatus = 'IN_PROGRESS';
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                name,
                category,
                effortWeight: effortWeight !== undefined ? Number(effortWeight) : undefined,
                assignedPartnerId,
                completionPercent: finalPercent !== undefined ? Number(finalPercent) : undefined,
                timeSpent: timeSpent !== undefined ? Number(timeSpent) : undefined,
                status: finalStatus
            },
            include: { project: true },
        });

        res.json(task);
    } catch (error: any) {
        next(error);
    }
};

export const getTasksByProject = async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                assignedPartner: { include: { user: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error: any) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await prisma.task.delete({
            where: { id },
        });
        res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
        next(error);
    }
};

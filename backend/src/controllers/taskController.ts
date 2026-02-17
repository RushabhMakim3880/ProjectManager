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
    const {
        completionPercent, timeSpent, status, name, category, effortWeight,
        assignedPartnerId, completedById: manualCompletedById
    } = req.body;

    try {
        const currentTask = await prisma.task.findUnique({ where: { id } });
        if (!currentTask) return next(new AppError('Task not found', 404));

        const authUserId = (req as AuthRequest).user?.userId;

        // Sync status and completionPercent
        let finalStatus = status;
        let finalPercent = completionPercent;
        let completedById = manualCompletedById || currentTask.completedById;
        let completedAt = currentTask.completedAt;

        if (status === 'DONE' && currentTask.status !== 'DONE') {
            finalPercent = 100;
            completedById = manualCompletedById || authUserId;
            completedAt = new Date();
        } else if (status && status !== 'DONE' && currentTask.status === 'DONE') {
            completedById = null;
            completedAt = null;
        } else if (completionPercent === 100 && currentTask.status !== 'DONE') {
            finalStatus = 'DONE';
            completedById = manualCompletedById || authUserId;
            completedAt = new Date();
        } else if (completionPercent !== undefined && completionPercent < 100 && currentTask.status === 'DONE') {
            finalStatus = 'IN_PROGRESS';
            completedById = null;
            completedAt = null;
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                name,
                category,
                effortWeight: effortWeight !== undefined ? Number(effortWeight) : undefined,
                assignedPartnerId: assignedPartnerId === "" ? null : assignedPartnerId,
                completionPercent: finalPercent !== undefined ? Number(finalPercent) : undefined,
                timeSpent: timeSpent !== undefined ? Number(timeSpent) : undefined,
                status: finalStatus,
                completedById,
                completedAt
            },
            include: {
                project: true,
                assignedPartner: { include: { user: true } },
                completedBy: true
            },
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
                completedBy: true
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

export const addTaskComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: taskId } = req.params;
    const { content, type } = req.body;
    const userId = req.user?.userId;

    try {
        if (!userId) return next(new AppError('Unauthorized', 401));

        const comment = await prisma.taskComment.create({
            data: {
                taskId,
                userId,
                content,
                type: type || 'COMMENT'
            },
            include: {
                user: true
            }
        });

        res.status(201).json(comment);
    } catch (error: any) {
        next(error);
    }
};

export const getTaskComments = async (req: Request, res: Response, next: NextFunction) => {
    const { id: taskId } = req.params;
    try {
        const comments = await prisma.taskComment.findMany({
            where: { taskId },
            include: {
                user: true
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    } catch (error: any) {
        next(error);
    }
};

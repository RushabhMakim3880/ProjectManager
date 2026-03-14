import { prisma } from '../lib/prisma.js';
import {} from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { notifyTaskAssigned, notifyTaskReassigned, notifyTaskCompleted, notifyTaskComment } from '../services/emailService.js';
import { calculateProjectContributions } from '../services/contributionService.js';
export const createTask = async (req, res, next) => {
    try {
        const { projectId, name, category, effortWeight, assignedPartnerId, status } = req.body;
        const userId = req.user?.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partnerProfile: true }
        });
        if (!user)
            return next(new AppError('Unauthorized', 401));
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
            include: {
                assignedPartner: { include: { user: true } },
                project: true
            }
        });
        res.status(201).json(task);
        // Fire-and-forget email notification
        if (task.assignedPartnerId && task.project) {
            notifyTaskAssigned(task, task.project).catch(() => { });
        }
        // Auto-recalculate contributions (fire-and-forget)
        if (task.effortWeight > 0) {
            calculateProjectContributions(projectId).catch(err => console.error('Auto-calc error:', err));
        }
    }
    catch (error) {
        next(error);
    }
};
export const updateTask = async (req, res, next) => {
    const { id } = req.params;
    const { completionPercent, timeSpent, status, name, category, effortWeight, assignedPartnerId, completedById: manualCompletedById } = req.body;
    try {
        const currentTask = await prisma.task.findUnique({ where: { id } });
        if (!currentTask)
            return next(new AppError('Task not found', 404));
        const authUserId = req.user?.userId;
        // Sync status and completionPercent
        let finalStatus = status;
        let finalPercent = completionPercent;
        let completedById = manualCompletedById || currentTask.completedById;
        let completedAt = currentTask.completedAt;
        if (status === 'DONE' && currentTask.status !== 'DONE') {
            finalPercent = 100;
            completedById = manualCompletedById || authUserId;
            completedAt = new Date();
        }
        else if (status && status !== 'DONE' && currentTask.status === 'DONE') {
            completedById = null;
            completedAt = null;
        }
        else if (completionPercent === 100 && currentTask.status !== 'DONE') {
            finalStatus = 'DONE';
            completedById = manualCompletedById || authUserId;
            completedAt = new Date();
        }
        else if (completionPercent !== undefined && completionPercent < 100 && currentTask.status === 'DONE') {
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
        // Fire-and-forget email notifications
        if (task.project) {
            // Task re-assigned
            if (assignedPartnerId && assignedPartnerId !== currentTask.assignedPartnerId) {
                const prevPartner = currentTask.assignedPartnerId
                    ? await prisma.partner.findUnique({ where: { id: currentTask.assignedPartnerId }, include: { user: true } })
                    : null;
                notifyTaskReassigned(task, task.project, prevPartner?.user?.name || 'Unassigned').catch(() => { });
            }
            // Task completed
            if (finalStatus === 'DONE' && currentTask.status !== 'DONE') {
                const completerName = task.completedBy?.name || task.assignedPartner?.user?.name || 'Someone';
                notifyTaskCompleted(task, task.project, completerName).catch(() => { });
            }
        }
        // Auto-recalculate contributions if effort or status changed
        if (task.projectId) {
            calculateProjectContributions(task.projectId).catch(err => console.error('Auto-calc error:', err));
        }
    }
    catch (error) {
        next(error);
    }
};
export const getTasksByProject = async (req, res, next) => {
    const { projectId } = req.params;
    const { role, userId } = req.user;
    try {
        // First check project access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { contributions: true }
        });
        if (!project)
            return next(new AppError('Project not found', 404));
        // ACL Check
        let hasAccess = false;
        if (role === 'ADMIN') {
            hasAccess = true;
        }
        else if (role === 'CLIENT') {
            hasAccess = project.clientId === userId;
        }
        else if (role === 'PARTNER') {
            const partner = await prisma.partner.findUnique({ where: { userId } });
            if (partner) {
                const isLead = [
                    project.projectLeadId, project.techLeadId, project.commsLeadId,
                    project.qaLeadId, project.salesOwnerId, project.salesPartnerId
                ].includes(partner.id);
                const isContributor = project.contributions.some((c) => c.partnerId === partner.id);
                hasAccess = isLead || isContributor;
            }
        }
        if (!hasAccess) {
            return next(new AppError('Forbidden: Access to this project tasks is restricted', 403));
        }
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                assignedPartner: { include: { user: true } },
                completedBy: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTask = async (req, res, next) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findUnique({
            where: { id },
            select: { projectId: true }
        });
        await prisma.task.delete({
            where: { id },
        });
        if (task?.projectId) {
            calculateProjectContributions(task.projectId).catch(err => console.error('Auto-calc error:', err));
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const addTaskComment = async (req, res, next) => {
    const { id: taskId } = req.params;
    const { content, type } = req.body;
    const userId = req.user?.userId;
    try {
        if (!userId)
            return next(new AppError('Unauthorized', 401));
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
        // Fire-and-forget email notification
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (task?.project) {
            notifyTaskComment(task, task.project, comment.user?.name || 'Someone', comment).catch(() => { });
        }
    }
    catch (error) {
        next(error);
    }
};
export const getTaskComments = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const getTaskStats = async (req, res, next) => {
    try {
        const { role, userId } = req.user;
        let filter = {};
        if (role === 'CLIENT') {
            filter = { project: { clientId: userId } };
        }
        else if (role === 'PARTNER') {
            const partner = await prisma.partner.findUnique({ where: { userId } });
            if (!partner)
                return res.status(403).json({ error: 'Partner profile not found' });
            filter = {
                OR: [
                    { assignedPartnerId: partner.id },
                    { project: {
                            OR: [
                                { projectLeadId: partner.id },
                                { techLeadId: partner.id },
                                { commsLeadId: partner.id },
                                { qaLeadId: partner.id },
                                { salesOwnerId: partner.id },
                                { salesPartnerId: partner.id }
                            ]
                        } }
                ]
            };
        }
        const [completed, pending, total] = await Promise.all([
            prisma.task.count({ where: { ...filter, status: 'DONE' } }),
            prisma.task.count({ where: { ...filter, status: { in: ['IN_PROGRESS', 'BACKLOG', 'REVIEW'] } } }),
            prisma.task.count({ where: filter }),
        ]);
        res.json({ completed, pending, total });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=taskController.js.map
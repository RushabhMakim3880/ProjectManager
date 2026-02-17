import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name, clientName, totalValue, startDate, endDate, description, weights,
            projectIdCustom, projectType, category, priority,
            clientContact, clientEmail, clientPhone, whatsappNumber, commsChannel, timezone, location,
            ndaSigned, internalDeadline, clientDeadline,
            objectives, deliverables, outOfScope, techStack, environments, accessReqs, dependencies, riskLevel,
            projectLeadId, techLeadId, commsLeadId, qaLeadId, salesOwnerId,
            enableContributionTracking, lockWeights, enableTaskLogging, effortScale, timeTrackingEnabled, approvalRequired,
            visibility, canEdit, canAddTasks, canFinalize, autoLock,
            specialInstructions, riskNotes, clientConstraints, escalationContact, internalRemarks,
            milestones
        } = req.body;

        const project = await prisma.project.create({
            data: {
                name,
                clientName,
                totalValue: totalValue ? Number(totalValue) : 0,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
                weights: typeof weights === 'string' ? weights : JSON.stringify(weights || {}),

                projectIdCustom,
                projectType,
                category,
                priority,
                clientContact,
                clientEmail,
                clientPhone,
                whatsappNumber,
                commsChannel,
                timezone,
                location,
                ndaSigned: !!ndaSigned,
                internalDeadline: internalDeadline ? new Date(internalDeadline) : null,
                clientDeadline: clientDeadline ? new Date(clientDeadline) : null,

                objectives,
                deliverables,
                outOfScope,
                techStack,
                environments,
                accessReqs,
                dependencies,
                riskLevel,

                projectLeadId,
                techLeadId,
                commsLeadId,
                qaLeadId,
                salesOwnerId,

                enableContributionTracking: !!enableContributionTracking,
                lockWeights: !!lockWeights,
                enableTaskLogging: !!enableTaskLogging,
                effortScale,
                timeTrackingEnabled: !!timeTrackingEnabled,
                approvalRequired: !!approvalRequired,

                visibility: visibility || 'INTERNAL',
                canEdit,
                canAddTasks,
                canFinalize,
                autoLock: !!autoLock,

                specialInstructions,
                riskNotes,
                clientConstraints,
                escalationContact,
                internalRemarks,

                milestones: {
                    create: milestones?.map((m: any) => ({
                        name: m.name,
                        dueDate: new Date(m.dueDate),
                        deliverables: m.deliverables,
                        status: m.status || 'PLANNED'
                    })) || []
                }
            },
            include: { milestones: true }
        });

        // Automatically create contributions for leads if tracking is enabled
        const leadIds = [projectLeadId, techLeadId, commsLeadId, qaLeadId, salesOwnerId].filter(id => id && id.trim() !== "");

        if (leadIds.length > 0) {
            await Promise.all(leadIds.map(partnerId =>
                prisma.contribution.upsert({
                    where: {
                        projectId_partnerId: {
                            projectId: project.id,
                            partnerId: partnerId
                        }
                    },
                    update: {},
                    create: {
                        projectId: project.id,
                        partnerId: partnerId,
                        percentage: 0 // Will be calculated live
                    }
                })
            ));
        }

        res.status(201).json(project);
    } catch (error: any) {
        next(error);
    }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                _count: { select: { tasks: true } },
                contributions: {
                    include: { partner: { include: { user: true } } }
                }
            },
        });
        res.json(projects);
    } catch (error: any) {
        next(error);
    }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: { assignedPartner: { include: { user: true } } },
                },
                contributions: {
                    include: { partner: { include: { user: true } } },
                },
                financialRecords: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                transactions: true,
                milestones: true,
            },
        });
        if (!project) return next(new AppError('Project not found', 404));
        res.json(project);
    } catch (error: any) {
        next(error);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const {
            name, clientName, totalValue, startDate, endDate, description, weights,
            projectType, category, priority, status,
            clientContact, clientEmail, clientPhone, whatsappNumber, commsChannel, timezone, location,
            ndaSigned, internalDeadline, clientDeadline,
            objectives, deliverables, outOfScope, techStack, environments, accessReqs, dependencies, riskLevel,
            projectLeadId, techLeadId, commsLeadId, qaLeadId, salesOwnerId,
            enableContributionTracking, lockWeights, enableTaskLogging, autoLock,
            milestones
        } = req.body;

        const project = await prisma.project.update({
            where: { id },
            data: {
                name,
                clientName,
                totalValue: totalValue !== undefined ? Number(totalValue) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                description,
                status,
                weights: weights ? (typeof weights === 'string' ? weights : JSON.stringify(weights)) : undefined,
                projectType,
                category,
                priority,
                clientContact,
                clientEmail,
                clientPhone,
                whatsappNumber,
                commsChannel,
                timezone,
                location,
                ndaSigned: ndaSigned !== undefined ? !!ndaSigned : undefined,
                internalDeadline: internalDeadline ? new Date(internalDeadline) : undefined,
                clientDeadline: clientDeadline ? new Date(clientDeadline) : undefined,
                objectives,
                deliverables,
                outOfScope,
                techStack,
                environments,
                accessReqs,
                dependencies,
                riskLevel,
                enableContributionTracking: enableContributionTracking !== undefined ? !!enableContributionTracking : undefined,
                lockWeights: lockWeights !== undefined ? !!lockWeights : undefined,
                enableTaskLogging: enableTaskLogging !== undefined ? !!enableTaskLogging : undefined,
                autoLock: autoLock !== undefined ? !!autoLock : undefined,
                projectLeadId,
                techLeadId,
                commsLeadId,
                qaLeadId,
                salesOwnerId
            }
        });

        res.json(project);
    } catch (error: any) {
        next(error);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await prisma.milestone.deleteMany({ where: { projectId: id } });
        await prisma.task.deleteMany({ where: { projectId: id } });
        await prisma.contribution.deleteMany({ where: { projectId: id } });
        await prisma.financial.deleteMany({ where: { projectId: id } });
        await prisma.payout.deleteMany({ where: { projectId: id } });

        await prisma.project.delete({
            where: { id },
        });
        res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        next(error);
    }
};

export const lockProject = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { isLocked: true },
        });
        res.json({ message: 'Project finalized and locked', project });
    } catch (error: any) {
        next(error);
    }
};

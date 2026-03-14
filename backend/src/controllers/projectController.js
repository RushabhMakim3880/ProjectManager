import { prisma } from '../lib/prisma.js';
import {} from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';
export const createProject = async (req, res, next) => {
    try {
        const { name, clientName, totalValue, startDate, endDate, description, projectIdCustom, projectType, category, priority, clientContact, clientEmail, clientPhone, whatsappNumber, commsChannel, timezone, location, ndaSigned, internalDeadline, clientDeadline, objectives, deliverables, outOfScope, techStack, environments, accessReqs, dependencies, riskLevel, projectLeadId, techLeadId, commsLeadId, qaLeadId, salesOwnerId, enableContributionTracking, enableTaskLogging, effortScale, timeTrackingEnabled, approvalRequired, visibility, canEdit, canAddTasks, canFinalize, autoLock, specialInstructions, riskNotes, clientConstraints, escalationContact, internalRemarks, milestones, githubUrl } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                clientName,
                totalValue: totalValue ? Number(totalValue) : 0,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
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
                githubUrl,
                milestones: {
                    create: milestones?.map((m) => ({
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
            await Promise.all(leadIds.map(partnerId => prisma.contribution.upsert({
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
            })));
        }
        res.status(201).json(project);
    }
    catch (error) {
        next(error);
    }
};
export const getProjects = async (req, res, next) => {
    try {
        const { role, userId } = req.user;
        let filter = {};
        if (role === 'CLIENT') {
            filter = { clientId: userId };
        }
        else if (role === 'PARTNER') {
            const partner = await prisma.partner.findUnique({ where: { userId } });
            if (!partner)
                return res.status(403).json({ error: 'Partner profile not found' });
            filter = {
                OR: [
                    { projectLeadId: partner.id },
                    { techLeadId: partner.id },
                    { commsLeadId: partner.id },
                    { qaLeadId: partner.id },
                    { salesOwnerId: partner.id },
                    { salesPartnerId: partner.id },
                    { contributions: { some: { partnerId: partner.id } } }
                ]
            };
        }
        const projects = await prisma.project.findMany({
            where: filter,
            include: {
                _count: { select: { tasks: true } },
                advances: true,
                contributions: {
                    include: { partner: { include: { user: true } } }
                }
            },
        });
        // Strip sensitive fields for non-admins
        if (role !== 'ADMIN') {
            projects.forEach((p) => {
                delete p.netProfit;
                delete p.internalRemarks;
                delete p.riskNotes;
            });
        }
        res.json(projects);
    }
    catch (error) {
        next(error);
    }
};
export const getProjectById = async (req, res, next) => {
    const { id } = req.params;
    const { role, userId } = req.user;
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
                advances: true,
                milestones: true,
            },
        });
        if (!project)
            return next(new AppError('Project not found', 404));
        // ACL Check
        if (role === 'CLIENT' && project.clientId !== userId) {
            return next(new AppError('Forbidden: Access to this project is restricted', 403));
        }
        if (role === 'PARTNER') {
            const partner = await prisma.partner.findUnique({ where: { userId } });
            if (!partner)
                return next(new AppError('Partner profile not found', 403));
            const isLead = [
                project.projectLeadId, project.techLeadId, project.commsLeadId,
                project.qaLeadId, project.salesOwnerId, project.salesPartnerId
            ].includes(partner.id);
            const isContributor = project.contributions.some((c) => c.partnerId === partner.id);
            if (!isLead && !isContributor) {
                return next(new AppError('Forbidden: Access to this project is restricted', 403));
            }
        }
        // Strip sensitive fields for non-admins
        if (role !== 'ADMIN') {
            const p = project;
            delete p.netProfit;
            delete p.internalRemarks;
            delete p.riskNotes;
            // Also hide detailed transactions if Client
            if (role === 'CLIENT') {
                delete p.transactions;
                delete p.financialRecords;
            }
        }
        res.json(project);
    }
    catch (error) {
        next(error);
    }
};
export const updateProject = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { name, clientName, totalValue, startDate, endDate, description, projectType, category, priority, status, clientContact, clientEmail, clientPhone, whatsappNumber, commsChannel, timezone, location, ndaSigned, internalDeadline, clientDeadline, objectives, deliverables, outOfScope, techStack, environments, accessReqs, dependencies, riskLevel, projectLeadId, techLeadId, commsLeadId, qaLeadId, salesOwnerId, enableContributionTracking, enableTaskLogging, autoLock, milestones, githubUrl } = req.body;
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
                enableTaskLogging: enableTaskLogging !== undefined ? !!enableTaskLogging : undefined,
                autoLock: autoLock !== undefined ? !!autoLock : undefined,
                projectLeadId,
                techLeadId,
                commsLeadId,
                qaLeadId,
                salesOwnerId,
                githubUrl
            }
        });
        res.json(project);
    }
    catch (error) {
        next(error);
    }
};
export const deleteProject = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const lockProject = async (req, res, next) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { isLocked: true },
        });
        res.json({ message: 'Project finalized and locked', project });
    }
    catch (error) {
        next(error);
    }
};
export const unlockProject = async (req, res, next) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { isLocked: false },
        });
        res.json({ message: 'Project unlocked', project });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=projectController.js.map
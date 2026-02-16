import {} from 'express';
import { prisma } from '../index.js';
export const createProject = async (req, res) => {
    try {
        const { name, clientName, totalValue, startDate, endDate, description, weights, projectIdCustom, projectType, category, priority, clientContact, clientEmail, clientPhone, whatsappNumber, commsChannel, timezone, location, ndaSigned, internalDeadline, clientDeadline, objectives, deliverables, outOfScope, techStack, environments, accessReqs, dependencies, riskLevel, projectLeadId, techLeadId, commsLeadId, qaLeadId, salesOwnerId, enableContributionTracking, lockWeights, enableTaskLogging, effortScale, timeTrackingEnabled, approvalRequired, visibility, canEdit, canAddTasks, canFinalize, autoLock, specialInstructions, riskNotes, clientConstraints, escalationContact, internalRemarks, milestones } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                clientName,
                totalValue: Number(totalValue),
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
                visibility,
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
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                _count: { select: { tasks: true } },
            },
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getProjectById = async (req, res) => {
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
                financialRecords: true,
                milestones: true,
            },
        });
        if (!project)
            return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const updateProject = async (req, res) => {
    const { id } = req.params;
    try {
        const { name, clientName, totalValue, startDate, endDate, description, weights, projectType, priority, status, clientContact, clientEmail, clientPhone, whatsappNumber, commsChannel, timezone, location, ndaSigned, internalDeadline, clientDeadline, objectives, deliverables, outOfScope, techStack, environments, accessReqs, dependencies, riskLevel, enableContributionTracking, lockWeights, enableTaskLogging, autoLock } = req.body;
        const project = await prisma.project.update({
            where: { id },
            data: {
                name,
                clientName,
                totalValue: totalValue ? Number(totalValue) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                description,
                status,
                weights: weights ? (typeof weights === 'string' ? weights : JSON.stringify(weights)) : undefined,
                projectType,
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
            }
        });
        res.json(project);
    }
    catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        // Delete related records first if needed, but Prisma can handle cascading if configured or we just delete.
        // For SQLite, we might need to delete milestones manually or let it error if not cascading.
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
        console.error('Project deletion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const lockProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { isLocked: true },
        });
        res.json({ message: 'Project finalized and locked', project });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=projectController.js.map
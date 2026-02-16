import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';

export const getPartners = async (req: Request, res: Response) => {
    try {
        const partners = await prisma.partner.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        displayName: true,
                        role: true,
                        isActive: true,
                        accountStatus: true,
                    },
                },
            },
        });
        res.json(partners);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPartnerById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                user: true,
                contributions: {
                    include: { project: true },
                },
                payouts: true,
            },
        });
        if (!partner) return res.status(404).json({ error: 'Partner not found' });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updatePartner = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
        // User fields
        name, displayName, role, accountStatus, twoFactorEnabled, password, loginStartDate,
        // Partner fields
        ...partnerData
    } = req.body;

    try {
        const currentPartner = await prisma.partner.findUnique({ where: { id } });
        if (!currentPartner) return res.status(404).json({ error: 'Partner not found' });

        // Update User part
        const userData: any = { name, displayName, role, accountStatus, twoFactorEnabled };
        if (password) {
            const bcrypt = await import('bcrypt');
            userData.password = await bcrypt.default.hash(password, 10);
        }
        if (loginStartDate) {
            userData.loginStartDate = new Date(loginStartDate);
        }

        // Remove undefined from userData
        Object.keys(userData).forEach(key => userData[key] === undefined && delete userData[key]);

        await prisma.user.update({
            where: { id: currentPartner.userId },
            data: userData
        });

        // Update Partner part
        // Ensure booleans are handled correctly
        const booleanFields = [
            'isEquity', 'hasVotingRights', 'canApprovePayouts', 'canFinalizeContribution',
            'canEditFinancials', 'canCreateProjects', 'isBaseShareEligible', 'baseShareDecayEnabled',
            'isIncludedInPerformancePool', 'isIncludedInBasePool', 'hasRevenueVisibility',
            'canLeadProjects', 'canHandleClientComms', 'canApproveScope', 'canLogTasks',
            'canEditOwnLogs', 'canEditOthersLogs', 'canViewContributionBreakdown',
            'canOverrideContribution', 'agreementAccepted', 'performanceTrackingEnabled'
        ];

        booleanFields.forEach(field => {
            if (partnerData[field] !== undefined) {
                partnerData[field] = !!partnerData[field];
            }
        });

        // Finalize dates
        const dateFields = ['loginStartDate', 'dateAccepted', 'joinDate', 'lastActiveDate', 'baseShareEligibilityStartDate'];
        dateFields.forEach(field => {
            if (partnerData[field]) {
                partnerData[field] = new Date(partnerData[field]);
            }
        });

        const partner = await prisma.partner.update({
            where: { id },
            data: partnerData,
            include: { user: true }
        });

        res.json(partner);
    } catch (error) {
        console.error('Update partner error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deletePartner = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) return res.status(404).json({ error: 'Partner not found' });

        await prisma.payout.deleteMany({ where: { partnerId: id } });
        await prisma.contribution.deleteMany({ where: { partnerId: id } });
        await prisma.task.updateMany({ where: { assignedPartnerId: id }, data: { assignedPartnerId: null } });

        await prisma.partner.delete({ where: { id } });
        await prisma.user.delete({ where: { id: partner.userId } });

        res.json({ message: 'Partner removed successfully' });
    } catch (error) {
        console.error('Delete partner error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createPartner = async (req: AuthRequest, res: Response) => {
    const {
        // User fields
        name, email, password, displayName, role, accountStatus, twoFactorEnabled, loginStartDate,
        // Partner fields
        ...partnerData
    } = req.body;

    try {
        let user = await prisma.user.findUnique({
            where: { email },
            include: { partnerProfile: true }
        });

        if (user && user.partnerProfile) {
            return res.status(400).json({ error: 'User is already a partner' });
        }

        if (!user) {
            const bcrypt = await import('bcrypt');
            const hashedPassword = await bcrypt.default.hash(password || 'partner123', 10);

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    displayName,
                    role: role || 'PARTNER',
                    password: hashedPassword,
                    accountStatus: accountStatus || 'ACTIVE',
                    twoFactorEnabled: !!twoFactorEnabled,
                    loginStartDate: loginStartDate ? new Date(loginStartDate) : null,
                },
                include: { partnerProfile: true }
            });
        }

        // Ensure booleans for partner
        const booleanFields = [
            'isEquity', 'hasVotingRights', 'canApprovePayouts', 'canFinalizeContribution',
            'canEditFinancials', 'canCreateProjects', 'isBaseShareEligible', 'baseShareDecayEnabled',
            'isIncludedInPerformancePool', 'isIncludedInBasePool', 'hasRevenueVisibility',
            'canLeadProjects', 'canHandleClientComms', 'canApproveScope', 'canLogTasks',
            'canEditOwnLogs', 'canEditOthersLogs', 'canViewContributionBreakdown',
            'canOverrideContribution', 'agreementAccepted', 'performanceTrackingEnabled'
        ];

        booleanFields.forEach(field => {
            if (partnerData[field] !== undefined) {
                partnerData[field] = !!partnerData[field];
            }
        });

        // Dates for partner
        const dateFields = ['loginStartDate', 'dateAccepted', 'joinDate', 'lastActiveDate', 'baseShareEligibilityStartDate'];
        dateFields.forEach(field => {
            if (partnerData[field]) {
                partnerData[field] = new Date(partnerData[field]);
            }
        });

        const partner = await prisma.partner.create({
            data: {
                ...partnerData,
                userId: user.id,
            },
            include: { user: true }
        });

        res.status(201).json(partner);
    } catch (error) {
        console.error('Create partner error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

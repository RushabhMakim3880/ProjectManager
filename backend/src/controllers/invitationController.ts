import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import crypto from 'crypto';

export const createInvitation = async (req: AuthRequest, res: Response) => {
    const { email, name, role, partnerType, isEquity, equityPercentage } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: 'Email and Name are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await prisma.invitation.create({
            data: {
                email,
                name,
                role: role || 'PARTNER',
                token,
                expiresAt,
                partnerType: partnerType || 'NON_EQUITY',
                isEquity: !!isEquity,
                equityPercentage: parseFloat(equityPercentage) || 0,
                invitedBy: req.user?.userId || null,
            }
        });

        // Dynamically determine base URL to avoid mismatched deployment links
        // We prioritize the current request host over the potentially stale FRONTEND_URL env var
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        let baseUrl = `${protocol}://${host}`;

        // If we are in local dev, allow override, otherwise trust the host
        if (process.env.NODE_ENV !== 'production' && process.env.FRONTEND_URL) {
            baseUrl = process.env.FRONTEND_URL;
        }

        console.log('INVITATION_LINK_GEN:', { host, baseUrl, env_url: process.env.FRONTEND_URL });
        const onboardingUrl = `${baseUrl}/onboarding/${token}`;

        res.status(201).json({
            message: 'Invitation created',
            invitation,
            onboardingUrl
        });
    } catch (error: any) {
        console.error('Create invitation error:', error);
        res.status(500).json({
            error: 'Create Invitation Failed',
            message: error.message,
            stack: error.stack
        });
    }
};

export const verifyInvitation = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token }
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (invitation.status !== 'PENDING') {
            return res.status(400).json({ error: `Invitation already ${invitation.status.toLowerCase()}` });
        }

        if (new Date() > invitation.expiresAt) {
            await prisma.invitation.update({
                where: { token },
                data: { status: 'EXPIRED' }
            });
            return res.status(400).json({ error: 'Invitation has expired' });
        }

        res.json(invitation);
    } catch (error) {
        console.error('Verify invitation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const acceptInvitation = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password, ...onboardingData } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token }
        });

        if (!invitation || invitation.status !== 'PENDING' || new Date() > invitation.expiresAt) {
            return res.status(400).json({ error: 'Invalid or expired invitation' });
        }

        const bcryptPkg = await import('bcryptjs');
        const bcrypt = (bcryptPkg as any).default || bcryptPkg;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User and Partner in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email: invitation.email,
                    name: invitation.name,
                    password: hashedPassword,
                    role: invitation.role,
                    accountStatus: 'ACTIVE',
                    isActive: true,
                }
            });

            const partner = await tx.partner.create({
                data: {
                    userId: user.id,
                    partnerType: invitation.partnerType,
                    isEquity: invitation.isEquity,
                    equityPercentage: invitation.equityPercentage,
                    ...onboardingData, // bank stats, phone, etc.
                    agreementAccepted: true,
                    dateAccepted: new Date(),
                }
            });

            await tx.invitation.update({
                where: { token },
                data: { status: 'ACCEPTED' }
            });

            return { user, partner };
        });

        res.status(201).json({ message: 'Onboarding complete', ...result });
    } catch (error: any) {
        console.error('Accept invitation error:', error);
        res.status(500).json({
            error: 'Accept Invitation Failed',
            message: error.message,
            stack: error.stack,
            phase: 'database_transaction'
        });
    }
};

export const getInvitations = async (req: AuthRequest, res: Response) => {
    try {
        const invitations = await prisma.invitation.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(invitations);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

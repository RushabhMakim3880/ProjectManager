import { type Request, type Response } from 'express';
import bcryptPkg from 'bcryptjs';
import jwtPkg from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const bcrypt = (bcryptPkg as any).default || bcryptPkg;
const jwt = (jwtPkg as any).default || jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'PARTNER',
            },
        });

        if (user.role === 'PARTNER') {
            await prisma.partner.create({
                data: {
                    userId: user.id,
                },
            });
        }

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: error.stack 
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { partnerProfile: true },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                partnerId: user.partnerProfile?.id,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            stack: error.stack
        });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const payload: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });

        if (!user) return res.status(401).json({ error: 'User not found' });

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    } catch (error: any) {
        console.error('Refresh error:', error);
        res.status(403).json({ 
            error: 'Invalid refresh token',
            message: error.message,
            stack: error.stack
        });
    }
};

import bcryptPkg from 'bcryptjs';
import jwtPkg from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';
const bcrypt = bcryptPkg.default || bcryptPkg;
const jwt = jwtPkg.default || jwtPkg;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
export const signup = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new AppError('User already exists', 400));
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
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { partnerProfile: true },
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Invalid credentials', 401));
        }
        const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        next(error);
    }
};
export const refresh = async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return next(new AppError('Refresh token required', 401));
    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user)
            return next(new AppError('User not found', 401));
        const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    }
    catch (error) {
        next(new AppError('Invalid refresh token', 403));
    }
};
export const me = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                partnerProfile: {
                    select: { id: true }
                }
            }
        });
        if (!user)
            return next(new AppError('User not found', 404));
        res.json({
            ...user,
            partnerId: user.partnerProfile?.id
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=authController.js.map
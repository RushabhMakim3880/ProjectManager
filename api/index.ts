import express, { Request, Response } from 'express';
import PrismaPkg from '@prisma/client';
import bcryptPkg from 'bcryptjs';
import jwtPkg from 'jsonwebtoken';

const { PrismaClient } = PrismaPkg;
const bcrypt = (bcryptPkg as any).default || bcryptPkg;
const jwt = (jwtPkg as any).default || jwtPkg;

const app = express();

// SELF-CONTAINED PRISMA INITIALIZATION
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
const prisma = new (PrismaClient as any)({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

app.get('/api/ping', (req: Request, res: Response) => {
    res.json({
        msg: 'Bridge is alive (Self-Contained Mode)',
        timestamp: new Date().toISOString(),
        db_present: !!dbUrl
    });
});

app.post('/api/auth/login', express.json(), async (req: Request, res: Response) => {
    console.log('BRIDGE_LOGIN_START');
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

        console.log('BRIDGE_LOGIN: Finding user...');
        const user = await (prisma as any).user.findUnique({
            where: { email },
            include: { partnerProfile: true },
        });

        if (!user) {
            console.log('BRIDGE_LOGIN: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('BRIDGE_LOGIN: Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('BRIDGE_LOGIN: Password mismatch');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('BRIDGE_LOGIN: Success!');
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
    } catch (err: any) {
        console.error('BRIDGE_LOGIN_FATAL:', err);
        res.status(500).json({
            error: 'Bridge Login Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

// Seed route kept for convenience
app.get('/api/debug/seed-admin', async (req: Request, res: Response) => {
    try {
        const email = 'admin@protrack.com';
        const hashedPassword = await bcrypt.hash('Password@123', 10);
        const user = await (prisma as any).user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                name: 'System Admin',
                role: 'ADMIN'
            }
        });
        res.json({ msg: 'Admin seeded', user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Proxy everything else to the main backend (Dynamically imported to avoid bundle bloat)
app.all('*', async (req: Request, res: Response) => {
    try {
        if (req.url.startsWith('/api/auth/')) {
            return res.status(404).json({ error: 'Auth route handled by bridge' });
        }
        
        console.log(`BRIDGE_PROXY: ${req.method} ${req.url}`);
        const { app: backendApp } = await import('../backend/src/index.js');
        const handler = (backendApp as any).default || backendApp;
        return handler(req, res);
    } catch (err: any) {
        res.status(500).json({ error: 'Proxy failed', message: err.message });
    }
});

export default app;

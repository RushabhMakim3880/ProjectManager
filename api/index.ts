import express, { Request, Response } from 'express';

// NUCLEAR ISOLATION BRIDGE
// This file has NO top-level library imports to prevent crashing before execution.
// Everything is imported dynamically inside the handlers.

const app = express();

app.get('/api/ping', (req: Request, res: Response) => {
    res.json({
        msg: 'Bridge is alive (Nuclear Isolation Mode)',
        timestamp: new Date().toISOString(),
        env_check: {
            has_db: !!process.env.DATABASE_URL,
            has_prisma_url: !!process.env.POSTGRES_PRISMA_URL,
            node_env: process.env.NODE_ENV
        }
    });
});

app.post('/api/auth/login', express.json(), async (req: Request, res: Response) => {
    console.log('NUCLEAR_LOGIN: Triggered');
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // DYNAMIC IMPORTS - These only run if the route is hit
        console.log('NUCLEAR_LOGIN: Importing dependencies...');
        const PrismaPkg = await import('@prisma/client');
        const bcryptPkg = await import('bcryptjs');
        const jwtPkg = await import('jsonwebtoken');

        const { PrismaClient } = PrismaPkg.default || PrismaPkg;
        const bcrypt = (bcryptPkg as any).default || bcryptPkg;
        const jwt = (jwtPkg as any).default || jwtPkg;

        console.log('NUCLEAR_LOGIN: Initializing Prisma...');
        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        const prisma = new (PrismaClient as any)({
            datasources: { db: { url: dbUrl } }
        });

        console.log('NUCLEAR_LOGIN: Querying user...');
        const user = await prisma.user.findUnique({
            where: { email },
            include: { partnerProfile: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('NUCLEAR_LOGIN: Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('NUCLEAR_LOGIN: Generating tokens...');
        const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

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

        console.log('NUCLEAR_LOGIN: Success!');
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
        console.error('NUCLEAR_LOGIN_CRASH:', err);
        res.status(500).json({
            error: 'Nuclear Login Failed',
            message: err.message,
            stack: err.stack,
            phase: 'execution'
        });
    }
});

// Seed route for emergencies
app.get('/api/debug/seed-admin', async (req: Request, res: Response) => {
    try {
        const bcryptPkg = await import('bcryptjs');
        const bcrypt = (bcryptPkg as any).default || bcryptPkg;
        const PrismaPkg = await import('@prisma/client');
        const { PrismaClient } = PrismaPkg.default || PrismaPkg;
        const prisma = new (PrismaClient as any)();

        const email = 'admin@protrack.com';
        const hashedPassword = await bcrypt.hash('Password@123', 10);
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, password: hashedPassword, name: 'System Admin', role: 'ADMIN' }
        });
        res.json({ msg: 'Admin seeded', user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// NO PROXYING TO BACKEND FOR NOW
// We need to stabilize login FIRST.

export default app;

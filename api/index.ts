import express, { Request, Response } from 'express';
import cors from 'cors';

// ROBUST API BRIDGE
// This version mounts routers directly to bypass main backend initialization crashes.

const app = express();

app.use(cors());

app.get('/api/ping', (req: Request, res: Response) => {
    res.json({
        msg: 'Bridge is alive (Robust Mode v4 - Seed Fix)',
        timestamp: new Date().toISOString(),
        env_check: {
            has_db: !!process.env.DATABASE_URL,
            has_jwt: !!process.env.JWT_SECRET,
            node_env: process.env.NODE_ENV
        }
    });
});

// Direct Auth Handler (Maintained for reliability)
app.post('/api/auth/login', express.json(), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const PrismaPkg = await import('@prisma/client');
        const bcryptPkg = await import('bcryptjs');
        const jwtPkg = await import('jsonwebtoken');

        const { PrismaClient } = PrismaPkg.default || PrismaPkg;
        const bcrypt = (bcryptPkg as any).default || bcryptPkg;
        const jwt = (jwtPkg as any).default || jwtPkg;

        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        const prisma = new (PrismaClient as any)({ datasources: { db: { url: dbUrl } } });

        const user = await prisma.user.findUnique({
            where: { email },
            include: { partnerProfile: true },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'protrack_dev_secret_2024';
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'protrack_dev_refresh_2024';

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
    } catch (err: any) {
        res.status(500).json({ error: 'Login Failed', message: err.message });
    }
});

// MOUNT ROUTERS DIRECTLY (With JSON parsing for POST/PUT requests)
app.use('/api/projects', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_PROJECTS_START');
        const { default: router } = await import('../backend/src/routes/projectRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_PROJECTS_FAILURE:', err);
        res.status(500).json({
            error: 'Project Router Failed',
            message: err.message,
            stack: err.stack,
            hint: 'Check if all backend dependencies are resolving correctly'
        });
    }
});

app.use('/api/partners', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_PARTNERS_START');
        const { default: router } = await import('../backend/src/routes/partnerRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_PARTNERS_FAILURE:', err);
        res.status(500).json({
            error: 'Partner Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.use('/api/auth', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_AUTH_START');
        const { default: router } = await import('../backend/src/routes/authRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_AUTH_FAILURE:', err);
        res.status(500).json({
            error: 'Auth Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.use('/api/invitations', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_INVITATIONS_START', {
            host: req.headers.host,
            fwd_proto: req.headers['x-forwarded-proto'],
            fwd_host: req.headers['x-forwarded-host'],
            frontend_url_env: process.env.FRONTEND_URL
        });
        const { default: router } = await import('../backend/src/routes/invitationRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_INVITATIONS_FAILURE:', err);
        res.status(500).json({
            error: 'Invitation Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.use('/api/audit', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_AUDIT_START');
        const { default: router } = await import('../backend/src/routes/auditRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_AUDIT_FAILURE:', err);
        res.status(500).json({
            error: 'Audit Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.use('/api/system', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_SYSTEM_START');
        const { default: router } = await import('../backend/src/routes/systemRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_SYSTEM_FAILURE:', err);
        res.status(500).json({
            error: 'System Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.use('/api/agreements', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_AGREEMENTS_START');
        const { default: router } = await import('../backend/src/routes/agreementRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_AGREEMENTS_FAILURE:', err);
        res.status(500).json({
            error: 'Agreement Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

    }
});

app.use('/api/finance', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_FINANCE_START');
        const { default: router } = await import('../backend/src/routes/financeRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_FINANCE_FAILURE:', err);
        res.status(500).json({
            error: 'Finance Router Failed',
            message: err.message,
            stack: err.stack
        });
    }
});

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
            update: { role: 'ADMIN' },
            create: { email, password: hashedPassword, name: 'System Admin', role: 'ADMIN' }
        });
        res.json({ msg: 'Admin seeded', user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default app;

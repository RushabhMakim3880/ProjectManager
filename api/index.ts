import express, { Request, Response } from 'express';
import cors from 'cors';

// ROBUST API BRIDGE
// This version mounts routers directly to bypass main backend initialization crashes.

const app = express();

app.use(cors({
    origin: true, // Allow all origins (or specifics if needed)
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors()); // Enable pre-flight for all routes

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

// Direct Auth Handler REMOVED - Delegating to backend/src/routes/authRoutes.ts via bridge below
// This prevents logic duplication and potential 500 errors from unmaintained inline code.

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

app.use('/api/payouts', express.json(), async (req, res, next) => {
    try {
        console.log('BRIDGE_PAYOUTS_START');
        const { default: router } = await import('../backend/src/routes/payoutRoutes.js');
        router(req, res, next);
    } catch (err: any) {
        console.error('BRIDGE_PAYOUTS_FAILURE:', err);
        res.status(500).json({
            error: 'Payout Router Failed',
            message: err.message,
            stack: err.stack
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

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Global Error Handler:', err);
    res.status(err.statusCode || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});

export default app;

import express, { Request, Response } from 'express';
import cors from 'cors';

// ROBUST API BRIDGE v6
// Using dynamic imports to bypass startup crashes.

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
        msg: 'Bridge is alive (Static Import Mode v5)',
        timestamp: new Date().toISOString(),
        env_check: {
            has_db: !!process.env.DATABASE_URL,
            has_jwt: !!process.env.JWT_SECRET,
            node_env: process.env.NODE_ENV
        }
    });
});

// MOUNT ROUTERS
// Using dynamic imports to prevent startup crashes if a module fails to load.
const mountBridge = (path: string, routeModulePath: string, name: string) => {
    app.use(path, express.json(), async (req, res, next) => {
        try {
            console.log(`BRIDGE_${name}_START`);
            const { default: router } = await import(routeModulePath);
            router(req, res, next);
        } catch (err: any) {
            console.error(`BRIDGE_${name}_FAILURE:`, err);
            res.status(500).json({
                error: `${name} Router Failed`,
                message: err.message,
                stack: err.stack,
                hint: 'Check if all backend dependencies are resolving correctly'
            });
        }
    });
};

mountBridge('/api/projects', '../backend/src/routes/projectRoutes.js', 'PROJECTS');
mountBridge('/api/partners', '../backend/src/routes/partnerRoutes.js', 'PARTNERS');
mountBridge('/api/auth', '../backend/src/routes/authRoutes.js', 'AUTH');
mountBridge('/api/invitations', '../backend/src/routes/invitationRoutes.js', 'INVITATIONS');
mountBridge('/api/audit', '../backend/src/routes/auditRoutes.js', 'AUDIT');
mountBridge('/api/system', '../backend/src/routes/systemRoutes.js', 'SYSTEM');
mountBridge('/api/agreements', '../backend/src/routes/agreementRoutes.js', 'AGREEMENTS');
mountBridge('/api/payouts', '../backend/src/routes/payoutRoutes.js', 'PAYOUTS');
mountBridge('/api/finance', '../backend/src/routes/financeRoutes.js', 'FINANCE');

app.get('/api/debug/db', async (req: Request, res: Response) => {
    try {
        const PrismaPkg = await import('@prisma/client');
        const { PrismaClient } = PrismaPkg.default || PrismaPkg;
        const prisma = new (PrismaClient as any)();
        await prisma.$connect();
        const userCount = await prisma.user.count();
        await prisma.$disconnect();
        res.json({ status: 'OK', message: 'Database connected successfully', userCount });
    } catch (err: any) {
        console.error('DB_CONNECT_ERROR:', err);
        res.status(500).json({
            error: 'Database Connection Failed',
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

app.get('/api/debug/db', async (req: Request, res: Response) => {
    try {
        const PrismaPkg = await import('@prisma/client');
        const { PrismaClient } = PrismaPkg.default || PrismaPkg;
        const prisma = new (PrismaClient as any)();
        await prisma.$connect();
        const userCount = await prisma.user.count();
        await prisma.$disconnect();
        res.json({ status: 'OK', message: 'Database connected successfully', userCount });
    } catch (err: any) {
        console.error('DB_CONNECT_ERROR:', err);
        res.status(500).json({
            error: 'Database Connection Failed',
            message: err.message,
            stack: err.stack
        });
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

import express, { Request, Response } from 'express';
import cors from 'cors';

// STATIC IMPORTS FOR VERCEL BUNDLING
// These ensure Vercel's NFT (Node File Trace) correctly includes the backend files.
import projectRoutes from '../backend/src/routes/projectRoutes.js';
import partnerRoutes from '../backend/src/routes/partnerRoutes.js';
import authRoutes from '../backend/src/routes/authRoutes.js';
import invitationRoutes from '../backend/src/routes/invitationRoutes.js';
import auditRoutes from '../backend/src/routes/auditRoutes.js';
import systemRoutes from '../backend/src/routes/systemRoutes.js';
import agreementRoutes from '../backend/src/routes/agreementRoutes.js';
import payoutRoutes from '../backend/src/routes/payoutRoutes.js';
import financeRoutes from '../backend/src/routes/financeRoutes.js';

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
app.use('/api/projects', projectRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/finance', financeRoutes);

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

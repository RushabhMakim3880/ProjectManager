import { app } from '../backend/src/index';
import { prisma } from '../backend/src/lib/prisma';

// Reconnected Ping
app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'Reconnected: Bridge and Backend are linked',
        database_ready: !!process.env.DATABASE_URL,
        env: process.env.NODE_ENV
    });
});

// Direct Database Connectivity Test
app.get('/api/db-check', async (req, res) => {
    try {
        console.log('API_DB_CHECK: Attempting to query DB version...');
        const result = await (prisma as any).$queryRaw`SELECT version()`;
        res.json({ status: 'connected', db: result });
    } catch (err: any) {
        console.error('DB_CHECK_FAILURE:', err);
        res.status(500).json({
            status: 'failed',
            error: err.message,
            code: err.code,
            meta: err.meta,
            hint: 'Check if your DATABASE_URL in Vercel is the pooled version (POSTGRES_PRISMA_URL)'
        });
    }
});

export default app;

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
        console.log('API_DB_CHECK: Running deep diagnostic...');
        const result = await (prisma as any).$queryRaw`SELECT version()`;
        res.json({
            status: 'connected',
            db: result,
            connection_info: {
                has_database_url: !!process.env.DATABASE_URL,
                has_prisma_url: !!process.env.POSTGRES_PRISMA_URL,
                db_url_prefix: process.env.DATABASE_URL?.substring(0, 15) || 'none',
                prisma_url_prefix: process.env.POSTGRES_PRISMA_URL?.substring(0, 15) || 'none'
            }
        });
    } catch (err: any) {
        console.error('DB_CHECK_FAILURE:', err);
        res.status(500).json({
            status: 'failed',
            error: err.message,
            code: err.code,
            meta: err.meta,
            details: {
                has_database_url: !!process.env.DATABASE_URL,
                has_prisma_url: !!process.env.POSTGRES_PRISMA_URL,
                db_url_prefix: process.env.DATABASE_URL?.substring(0, 15) || 'none',
                prisma_url_prefix: process.env.POSTGRES_PRISMA_URL?.substring(0, 15) || 'none',
                env_node: process.env.NODE_ENV
            },
            hint: 'Check if your DATABASE_URL in Vercel is the pooled version (POSTGRES_PRISMA_URL)'
        });
    }
});

export default app;

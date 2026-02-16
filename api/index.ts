import express from 'express';
const app = express();

// ABSOLUTELY NO IMPORTS FROM BACKEND
// THIS IS A PURE ISOLATION TEST

app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'Isolator Test: Bridge is alive',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/debug/load-prisma', async (req, res) => {
    try {
        console.log('DEBUG: Attempting dynamic import of Prisma...');
        const { prisma } = await import('../backend/src/lib/prisma.js');
        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        res.json({
            msg: 'Prisma module loaded successfully',
            db_url_present: !!dbUrl,
            db_url_start: dbUrl?.substring(0, 10)
        });
    } catch (err: any) {
        console.error('DEBUG_LOAD_FAILURE:', err);
        res.status(500).json({
            error: 'Prisma load failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.get('/api/debug/load-backend', async (req, res) => {
    try {
        console.log('DEBUG: Attempting dynamic import of Backend App...');
        const { app: backendApp } = await import('../backend/src/index.js');
        res.json({ msg: 'Backend main module loaded successfully' });
    } catch (err: any) {
        console.error('DEBUG_LOAD_FAILURE:', err);
        res.status(500).json({
            error: 'Backend load failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.get('/api/auth/login', (req, res) => {
    res.status(200).json({
        msg: 'Isolator Test: Mock Login Success',
        note: 'If you see this, the bridge is working but the backend is likely causing the original crash.'
    });
});

export default app;

import { app } from '../backend/src/index';

// Direct Ping for Vercel Debug
app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'Bridge is alive',
        backend_env: process.env.NODE_ENV,
        has_db_url: !!process.env.DATABASE_URL
    });
});

export default app;

import express from 'express';
const app = express();

// ABSOLUTELY NO IMPORTS FROM BACKEND
// THIS IS A PURE ISOLATION TEST

app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'Isolator Test: Bridge is alive',
        timestamp: new Date().toISOString(),
        note: 'This bridge is intentionally disconnected from the backend source.'
    });
});

app.get('/api/auth/login', (req, res) => {
    res.status(200).json({
        msg: 'Isolator Test: Mock Login Success',
        note: 'If you see this, the bridge is working but the backend is likely causing the original crash.'
    });
});

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

// Routes
import authRoutes from './routes/authRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import agreementRoutes from './routes/agreementRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import { finalizeProject } from './controllers/payoutController.js';
import { logAction } from './middleware/auditMiddleware.js';
import { authenticate, authorize } from './middleware/authMiddleware.js';

app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/invitations', invitationRoutes);

app.post('/api/projects/:projectId/finalize', authenticate, authorize(['ADMIN']), logAction('FINALIZE', 'PROJECT'), finalizeProject);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('Project Tracker API is running');
});

// Catch-all Debugging
app.use((req, res) => {
    console.log(`[404] Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Route not found in Express backend',
        method: req.method,
        url: req.url,
        base: req.baseUrl
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER_ERROR:', err);
    res.status(500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} else {
    console.log('Server is running in Production/Serverless mode');
}

import { prisma } from './lib/prisma.js';
export { app, prisma };

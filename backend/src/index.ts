import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const prisma = new (PrismaClient as any)();

app.use(cors());
app.use(express.json());

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

// Root route
app.get('/', (req, res) => {
    res.send('Project Tracker API is running');
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} else {
    console.log('Server is running in Production/Serverless mode');
}

export { app, prisma };


import express from 'express';
import { getCompanySummary, injectCapital, getCapitalInjections, deleteCapitalInjection } from '../controllers/financeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Partner financial view
router.get('/company-summary', authenticate, getCompanySummary);

// Admin only capital injection (or partners if allowed, keeping safe with ADMIN for now)
// Capital Injection Management
router.post('/capital-injection', authenticate, authorize(['ADMIN', 'PARTNER']), injectCapital);
router.get('/capital-injections/:partnerId', authenticate, authorize(['ADMIN', 'PARTNER']), getCapitalInjections);
router.delete('/capital-injections/:id', authenticate, authorize(['ADMIN']), deleteCapitalInjection);

export default router;

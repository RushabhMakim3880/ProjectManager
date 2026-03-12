import { Router } from 'express';
import { getAgencyStats, getPartnerPerformance, getCashflowData } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Only ADMIN and optionally EQUITY PARTNERS can see analytics
router.get('/agency', authenticate, authorize(['ADMIN', 'PARTNER']), getAgencyStats);
router.get('/partners', authenticate, authorize(['ADMIN', 'PARTNER']), getPartnerPerformance);
router.get('/cashflow', authenticate, authorize(['ADMIN', 'PARTNER']), getCashflowData);

export default router;

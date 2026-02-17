import express from 'express';
import { getCompanySummary, injectCapital } from '../controllers/financeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();
// Public/Partner financial view
router.get('/company-summary', authenticate, getCompanySummary);
// Admin only capital injection (or partners if allowed, keeping safe with ADMIN for now)
router.post('/capital-injection', authenticate, authorize(['ADMIN', 'PARTNER']), injectCapital);
export default router;
//# sourceMappingURL=financeRoutes.js.map
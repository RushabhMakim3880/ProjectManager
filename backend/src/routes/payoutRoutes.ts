import { Router } from 'express';
import { getPayouts } from '../controllers/payoutController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getPayouts);

export default router;

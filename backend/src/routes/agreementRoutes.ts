import { Router } from 'express';
import { getCurrentAgreement, createAgreementVersion } from '../controllers/agreementController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/current', authenticate, getCurrentAgreement);
router.post('/', authenticate, authorize(['ADMIN']), createAgreementVersion);

export default router;

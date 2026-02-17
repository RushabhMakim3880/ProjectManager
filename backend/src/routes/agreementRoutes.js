import { Router } from 'express';
import { getCurrentAgreement, createAgreementVersion, signAgreement } from '../controllers/agreementController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/current', authenticate, getCurrentAgreement);
router.post('/', authenticate, authorize(['ADMIN']), createAgreementVersion);
router.post('/sign', authenticate, signAgreement);
export default router;
//# sourceMappingURL=agreementRoutes.js.map
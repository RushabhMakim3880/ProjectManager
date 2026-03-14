import { Router } from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/systemController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/settings', authenticate, getSystemSettings);
router.put('/settings', authenticate, authorize(['ADMIN']), updateSystemSettings);
export default router;
//# sourceMappingURL=systemRoutes.js.map
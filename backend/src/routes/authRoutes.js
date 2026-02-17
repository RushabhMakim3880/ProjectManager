import { Router } from 'express';
import { signup, login, refresh, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);
export default router;
//# sourceMappingURL=authRoutes.js.map
import { Router } from 'express';
import { createInvitation, verifyInvitation, acceptInvitation, getInvitations } from '../controllers/invitationController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
// Admin only: create and list invitations
router.post('/', authenticate, authorize(['ADMIN']), createInvitation);
router.get('/', authenticate, authorize(['ADMIN']), getInvitations);
// Public: verify and accept onboarding
router.get('/verify/:token', verifyInvitation);
router.post('/accept/:token', acceptInvitation);
export default router;
//# sourceMappingURL=invitationRoutes.js.map
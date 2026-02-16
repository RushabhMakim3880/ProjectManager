import { Router } from 'express';
import { getPartners, getPartnerById, updatePartner, createPartner, deletePartner } from '../controllers/partnerController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getPartners);
router.get('/:id', authenticate, getPartnerById);
router.post('/', authenticate, authorize(['ADMIN']), createPartner);
router.patch('/:id', authenticate, authorize(['ADMIN']), updatePartner);
router.delete('/:id', authenticate, authorize(['ADMIN']), deletePartner);

export default router;

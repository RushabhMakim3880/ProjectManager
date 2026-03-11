import { Router } from 'express';
import {
    createEnquiry,
    getEnquiries,
    getEnquiryById,
    updateEnquiry,
    getPublicEnquiry,
    submitDiscoveryForm,
    convertEnquiryToProject,
    deleteEnquiry,
    createQuotation,
    getQuotations,
    createProposal,
    getProposals
} from '../controllers/enquiryController.js';
import {
    addEnquiryNote,
    getEnquiryNotes,
    deleteEnquiryNote
} from '../controllers/enquiryNoteController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/', createEnquiry);
router.get('/public/:id', getPublicEnquiry);
router.put('/public/:id/discovery', submitDiscoveryForm);

// Protected CRM routes
router.get('/', authenticate, authorize(['ADMIN', 'PARTNER']), getEnquiries);
router.get('/:id', authenticate, authorize(['ADMIN', 'PARTNER']), getEnquiryById);
router.patch('/:id', authenticate, authorize(['ADMIN', 'PARTNER']), updateEnquiry);
router.post('/:id/convert', authenticate, authorize(['ADMIN', 'PARTNER']), convertEnquiryToProject);
router.delete('/:id', authenticate, authorize(['ADMIN', 'PARTNER']), deleteEnquiry);

// Proposals & Quotations
router.post('/:id/quotations', authenticate, authorize(['ADMIN', 'PARTNER']), createQuotation);
router.get('/:id/quotations', authenticate, authorize(['ADMIN', 'PARTNER']), getQuotations);
router.post('/:id/proposals', authenticate, authorize(['ADMIN', 'PARTNER']), createProposal);
router.get('/:id/proposals', authenticate, authorize(['ADMIN', 'PARTNER']), getProposals);

// Lead Notes
router.post('/:id/notes', authenticate, authorize(['ADMIN', 'PARTNER']), addEnquiryNote);
router.get('/:id/notes', authenticate, authorize(['ADMIN', 'PARTNER']), getEnquiryNotes);
router.delete('/notes/:noteId', authenticate, authorize(['ADMIN', 'PARTNER']), deleteEnquiryNote);

export default router;

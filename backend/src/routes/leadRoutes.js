import { Router } from 'express';
import { searchLeads, importLead, checkExistingLeads, saveLead, getLeads, promoteToEnquiry, generateAILeadEmail, sendColdEmail } from '../controllers/leadController.js';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../controllers/emailTemplateController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
router.post('/search', authenticate, authorize(['ADMIN']), searchLeads);
router.post('/check-duplicates', authenticate, authorize(['ADMIN']), checkExistingLeads);
router.post('/save', authenticate, authorize(['ADMIN']), saveLead);
router.get('/saved', authenticate, authorize(['ADMIN']), getLeads);
router.post('/promote/:id', authenticate, authorize(['ADMIN']), promoteToEnquiry);
router.post('/generate-email', authenticate, authorize(['ADMIN']), generateAILeadEmail);
router.post('/send-email', authenticate, authorize(['ADMIN']), sendColdEmail);
router.post('/import', authenticate, authorize(['ADMIN']), importLead); // Legacy, kept for compatibility
// Email Templates
router.get('/templates', authenticate, authorize(['ADMIN']), getTemplates);
router.post('/templates', authenticate, authorize(['ADMIN']), createTemplate);
router.put('/templates/:id', authenticate, authorize(['ADMIN']), updateTemplate);
router.delete('/templates/:id', authenticate, authorize(['ADMIN']), deleteTemplate);
export default router;
//# sourceMappingURL=leadRoutes.js.map
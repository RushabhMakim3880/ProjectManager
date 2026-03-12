import express from 'express';
import { getTransactions, createTransaction, deleteTransaction, processReceipt } from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { logAction } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.get('/:projectId', authenticate, getTransactions);
router.post('/', authenticate, authorize(['ADMIN', 'PARTNER']), logAction('CREATE', 'TRANSACTION'), createTransaction);
router.delete('/:id', authenticate, authorize(['ADMIN', 'PARTNER']), logAction('DELETE', 'TRANSACTION'), deleteTransaction);
router.post('/process-receipt', authenticate, authorize(['ADMIN', 'PARTNER']), processReceipt);

export default router;

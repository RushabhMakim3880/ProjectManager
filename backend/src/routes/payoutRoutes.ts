import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
    finalizeProject, 
    logAdvancePayout, 
    getAdvances, 
    getPayouts, 
    getProjectPredictions, 
    updateAdvancePayout, 
    deleteAdvancePayout 
} from '../controllers/payoutController.js';

const router = Router();

router.get('/all', authenticate, getPayouts);
router.post('/finalize/:projectId', authenticate, finalizeProject);
router.get('/predictions/:projectId', authenticate, getProjectPredictions);
router.post('/advance/:projectId', authenticate, logAdvancePayout);
router.get('/advance/:projectId', authenticate, getAdvances);
router.put('/advance/:projectId/:advanceId', authenticate, updateAdvancePayout);
router.delete('/advance/:projectId/:advanceId', authenticate, deleteAdvancePayout);

export default router;

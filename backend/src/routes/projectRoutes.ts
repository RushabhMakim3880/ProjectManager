import { Router } from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject, lockProject } from '../controllers/projectController.js';
import { createTask, updateTask, getTasksByProject, deleteTask, getTaskComments, addTaskComment } from '../controllers/taskController.js';
import { recalculateProject } from '../controllers/financialController.js';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Project routes
router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.post('/', authenticate, authorize(['ADMIN']), createProject);
router.put('/:id', authenticate, authorize(['ADMIN']), updateProject);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteProject);
router.patch('/:id/lock', authenticate, authorize(['ADMIN']), lockProject);
router.post('/:projectId/recalculate', authenticate, authorize(['ADMIN']), recalculateProject);

// Task routes
router.get('/:projectId/tasks', authenticate, getTasksByProject);
router.post('/tasks', authenticate, createTask); // Decentralized: Auth happens in controller
router.patch('/tasks/:id', authenticate, updateTask);
router.delete('/tasks/:id', authenticate, authorize(['ADMIN']), deleteTask);
router.get('/tasks/:id/comments', authenticate, getTaskComments);
router.post('/tasks/:id/comments', authenticate, addTaskComment);

// Transaction routes
router.get('/:projectId/transactions', authenticate, getTransactions);
router.post('/transactions', authenticate, authorize(['ADMIN']), createTransaction);
router.delete('/transactions/:id', authenticate, authorize(['ADMIN']), deleteTransaction);

export default router;

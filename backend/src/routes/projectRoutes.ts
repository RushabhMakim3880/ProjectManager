import { Router } from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject, lockProject } from '../controllers/projectController.js';
import { createTask, updateTask, getTasksByProject, deleteTask } from '../controllers/taskController.js';
import { recalculateProject } from '../controllers/financialController.js';
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
router.post('/tasks', authenticate, authorize(['ADMIN']), createTask);
router.patch('/tasks/:id', authenticate, updateTask);
router.delete('/tasks/:id', authenticate, authorize(['ADMIN']), deleteTask);

export default router;

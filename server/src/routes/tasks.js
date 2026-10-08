import { Router } from 'express';
import { getTasks, createTask, updateTask, patchTaskStatus, deleteTask } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { projectAccess } from '../middleware/projectAccess.js';
import { objectIdGuard } from '../middleware/objectIdGuard.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, patchTaskStatusSchema, taskQuerySchema } from '../validators/taskValidator.js';

const router = Router();

router.use(authMiddleware);

// Project-scoped
router.get('/projects/:id/tasks', projectAccess, validateQuery(taskQuerySchema), getTasks);
router.post('/projects/:id/tasks', projectAccess, validate(createTaskSchema), createTask);

// Task-level
router.put('/tasks/:id', objectIdGuard, validate(updateTaskSchema), updateTask);
router.patch('/tasks/:id/status', objectIdGuard, validate(patchTaskStatusSchema), patchTaskStatus);
router.delete('/tasks/:id', objectIdGuard, deleteTask);

export default router;

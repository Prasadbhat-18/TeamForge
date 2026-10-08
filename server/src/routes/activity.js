import { Router } from 'express';
import { getActivity } from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { projectAccess } from '../middleware/projectAccess.js';

const router = Router();

router.use(authMiddleware);
router.get('/projects/:id/activity', projectAccess, getActivity);

export default router;

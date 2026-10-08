import { Router } from 'express';
import {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember, removeMember,
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { projectAccess, ownerOnly } from '../middleware/projectAccess.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/projectValidator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/:id', projectAccess, getProject);
router.put('/:id', projectAccess, ownerOnly, validate(updateProjectSchema), updateProject);
router.delete('/:id', projectAccess, ownerOnly, deleteProject);
router.post('/:id/members', projectAccess, ownerOnly, validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', projectAccess, ownerOnly, removeMember);

export default router;

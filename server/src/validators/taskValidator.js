import { z } from 'zod';

const statusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').trim(),
  description: z.string().max(2000).trim().optional().default(''),
  status: statusEnum,
  priority: priorityEnum,
  assignee: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assignee: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const patchTaskStatusSchema = z.object({
  status: statusEnum,
  position: z.number().int().min(1),
});

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assignee: z.string().optional(),
});

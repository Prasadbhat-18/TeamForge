import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  description: z.string().max(500, 'Description too long').trim().optional().default(''),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(500).trim().optional(),
  })
  .refine((d) => d.name !== undefined || d.description !== undefined, {
    message: 'At least one field must be provided',
  });

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

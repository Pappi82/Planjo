import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

// Project schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  status: z.enum(['planning', 'active', 'paused', 'completed']).optional(),
  colorTheme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  techStack: z.array(z.string()).optional(),
  repoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().datetime().optional().or(z.literal('')).or(z.null()),
  targetDate: z.string().datetime().optional().or(z.literal('')).or(z.null()),
});

// Task schemas
export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Task title is required').max(500, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  status: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')).or(z.null()),
  estimatedHours: z.number().min(0).max(1000).optional().or(z.null()),
  parentTaskId: z.string().optional().or(z.null()),
});

// Credential schemas
export const createCredentialSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  category: z.enum(['api_keys', 'database', 'services', 'ssh_keys', 'env_vars', 'files', 'other']),
  label: z.string().min(1, 'Label is required').max(200, 'Label is too long'),
  value: z.string().min(1, 'Value is required'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(2000, 'Notes are too long').optional(),
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
});

// Vault file schemas
export const createVaultFileSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename is too long'),
  content: z.string().min(1, 'Content is required'),
  mimeType: z.string().optional(),
  notes: z.string().max(2000, 'Notes are too long').optional(),
});

// Helper function to validate and return errors
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { success: false, error: firstError.message };
  }
  return { success: true, data: result.data };
}

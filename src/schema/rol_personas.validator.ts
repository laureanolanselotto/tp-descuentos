import {z} from 'zod';

export const createRolPersonaSchema = z.object({
  email_admins: z.string().min(1, 'Email admins is required').email('Email admins must be a valid email'),
});

export const updateRolPersonaSchema = createRolPersonaSchema.partial();
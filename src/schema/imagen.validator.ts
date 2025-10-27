import { z } from 'zod';

export const createImagenSchema = z.object({
  url: z.string().url('Url must be a valid URL'),
  nombre: z.string().min(1, 'Nombre is required'),
});

export const updateImagenSchema = createImagenSchema.partial();

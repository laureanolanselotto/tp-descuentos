import { z } from 'zod';

export const createImagenSchema = z.object({
  url: z.string().min(1, 'Url is required').refine(
    (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
    { message: 'Url must be a valid URL or path (starting with http://, https://, or /)' }
  ),
  nombre: z.string().min(1, 'Nombre is required'),
});

export const updateImagenSchema = createImagenSchema.partial();

import { z } from 'zod';

export const createHistorialSchema = z.object({
  personaId: z.string().min(1, "personaId es requerido"),
  personaNombre: z.string().min(1, "personaNombre es requerido"),
  entidad: z.string().min(1, "entidad es requerida"),
  entidadId: z.string().min(1, "entidadId es requerido"),
  accion: z.enum(["CREATE", "UPDATE", "DELETE"], {
    errorMap: () => ({ message: "accion debe ser CREATE, UPDATE o DELETE" })
  }),
  cambios: z.object({
    antes: z.record(z.any()).optional(),
    despues: z.record(z.any()).optional()
  }).optional(),
  descripcion: z.string().optional()
});

export const queryHistorialSchema = z.object({
  personaId: z.string().optional(),
  entidad: z.string().optional(),
  accion: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

import { z } from 'zod';

export const createBeneficioSchema = z.object({
  descripcion: z.string().min(1, 'Descripcion is required'),
  discount: z.number().positive('Discount must be positive').optional(),
  cant_cuotas: z.number().positive().optional(),
  discountType: z.string().min(1, 'Discount type is required'),
  availableDays: z.array(z.number().min(0).max(6)).min(1, 'At least one day is required'),
  fecha_desde: z.string().min(1, 'Fecha desde is required'),
  fecha_hasta: z.string().min(1, 'Fecha hasta is required'),
  limit: z.string().min(1, 'Limit is required'),
  walletId: z.string().min(1, 'Wallet ID is required'),
  rubroId: z.string().min(1, 'Rubro ID is required'),
  tope_reintegro: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  localidades: z.array(z.string()).optional(),
});

export const updateBeneficioSchema = createBeneficioSchema.partial();

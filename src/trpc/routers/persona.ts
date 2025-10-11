import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc.js';
import { persona } from '../../personas/personas.entity.js';
import { createPersonaSchema, updatePersonaSchema, idSchema } from '../schemas.js';
import { ObjectId } from '@mikro-orm/mongodb';
import bcrypt from 'bcryptjs';

// Función utilitaria simplificada basada en el controlador
async function findByIdOrObjectId(em: any, id: string) {
  try {
    return await em.findOneOrFail(persona, { id }, { populate: ['wallets', 'localidad', 'notificaciones'] });
  } catch (e) {
    return await em.findOneOrFail(persona, { _id: new ObjectId(id) }, { populate: ['wallets', 'localidad', 'notificaciones'] });
  }
}

export const personaRouter = router({
  // GET todas las personas - igual al controlador findAll
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const personas = await ctx.em.find(persona, {}, { populate: ['wallets', 'localidad', 'notificaciones'] });
        return {
          message: 'found all personas',
          data: personas
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }
    }),

  // GET persona por ID - igual al controlador findOne
  getById: publicProcedure
    .input(z.object({ id: idSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const personaFound = await findByIdOrObjectId(ctx.em, input.id);
        return {
          message: 'found persona',
          data: personaFound
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Persona not found'
        });
      }
    }),

  // POST crear persona - igual al controlador add con conversión de tipos
  create: publicProcedure
    .input(createPersonaSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Hash del password
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        // Preparar datos como en el controlador con conversión de tipos
        const personaData = {
          ...input,
          password: hashedPassword,
          tel: parseInt(input.tel),
          dni: parseInt(input.dni)
        };
        // Remover campos que no son parte de la entidad base
        delete (personaData as any).wallets;
        delete (personaData as any).localidadId;
        
        const personaCreated = ctx.em.create(persona, personaData);
        await ctx.em.flush();
        return {
          message: 'persona created',
          data: personaCreated
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }
    }),

  // PUT actualizar persona - igual al controlador update
  update: publicProcedure
    .input(z.object({ 
      id: idSchema, 
      data: updatePersonaSchema 
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const personaToUpdate = await findByIdOrObjectId(ctx.em, input.id);
        ctx.em.assign(personaToUpdate, input.data);
        await ctx.em.flush();
        return {
          message: 'persona updated',
          data: personaToUpdate
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Persona not found'
        });
      }
    }),

  // DELETE persona - igual al controlador remove
  delete: publicProcedure
    .input(z.object({ id: idSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        const personaToRemove = await findByIdOrObjectId(ctx.em, input.id);
        await ctx.em.removeAndFlush(personaToRemove);
        return {
          message: 'persona deleted',
          data: { id: input.id }
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Persona not found'
        });
      }
    }),

  // LOGIN persona
  login: publicProcedure
    .input(z.object({
      email: z.string().email('Must be a valid email'),
      password: z.string().min(1, 'Password is required')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Buscar persona por email - incluir password explícitamente
        const personaFound = await ctx.em.findOne(persona, { email: input.email }, { 
          populate: ['wallets', 'localidad'],
          fields: ['*', 'password'] // Incluir explícitamente el campo password que está hidden
        });

        if (!personaFound) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas'
          });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(input.password, personaFound.password);
        
        if (!isPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas'
          });
        }

        // Login exitoso - remover password de la respuesta
        const { password: _, ...personaData } = personaFound;
        return {
          message: 'Login exitoso',
          data: personaData
        };

      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }
    }),
});
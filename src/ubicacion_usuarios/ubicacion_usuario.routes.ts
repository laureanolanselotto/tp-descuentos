import { Router } from 'express';
import { sanitizeUbicacionUsuarioInput, findAll, findOne, add, update, remove } from './ubicacion_usuario.controler.js';

export const ubicacionUsuarioRouter = Router();

ubicacionUsuarioRouter.get('/', findAll);
ubicacionUsuarioRouter.get('/:id', findOne);
ubicacionUsuarioRouter.post('/', sanitizeUbicacionUsuarioInput, add);
ubicacionUsuarioRouter.put('/:id', sanitizeUbicacionUsuarioInput, update);
ubicacionUsuarioRouter.patch('/:id', sanitizeUbicacionUsuarioInput, update);
ubicacionUsuarioRouter.delete('/:id', remove);

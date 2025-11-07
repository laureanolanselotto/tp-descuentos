import { Router } from 'express';
import { sanitizeRolesInput, findAll, findOne, add, update, remove } from './rol_personas.controler.js';

export const RolPersonasRouter = Router();

RolPersonasRouter.get('/', findAll);
RolPersonasRouter.get('/:id', findOne);
RolPersonasRouter.post('/', sanitizeRolesInput, add);
RolPersonasRouter.put('/:id', sanitizeRolesInput, update);
RolPersonasRouter.patch('/:id', sanitizeRolesInput, update);
RolPersonasRouter.delete('/:id', remove);

import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from './personas.controler.js';

export const PersonasRouter = Router();

PersonasRouter.get('/', findAll);
PersonasRouter.get('/:id', findOne);
PersonasRouter.post('/', sanitizePersonaInput, add);
PersonasRouter.put('/:id', sanitizePersonaInput, update);
PersonasRouter.patch('/:id', sanitizePersonaInput, update);
PersonasRouter.delete('/:id', remove);
import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from '../personas/personas.controler.js';

export const RubrosRouter = Router();

RubrosRouter.get('/', findAll);
RubrosRouter.get('/:id', findOne);
RubrosRouter.post('/', sanitizePersonaInput, add);
RubrosRouter.put('/:id', sanitizePersonaInput, update);
RubrosRouter.patch('/:id', sanitizePersonaInput, update);
RubrosRouter.delete('/:id', remove);

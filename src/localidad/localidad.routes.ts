import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from '../personas/personas.controler.js';

export const LocalidadRouter = Router();

LocalidadRouter.get('/', findAll);
LocalidadRouter.get('/:id', findOne);
LocalidadRouter.post('/', sanitizePersonaInput, add);
LocalidadRouter.put('/:id', sanitizePersonaInput, update);
LocalidadRouter.patch('/:id', sanitizePersonaInput, update);
LocalidadRouter.delete('/:id', remove);

import { Router } from 'express';
import { sanitizeLocalidadInput, findAll, findOne, add, update, remove } from './localidad.controler.js';

export const LocalidadRouter = Router();

LocalidadRouter.get('/', findAll);
LocalidadRouter.get('/:id', findOne);
LocalidadRouter.post('/', sanitizeLocalidadInput, add);
LocalidadRouter.put('/:id', sanitizeLocalidadInput, update);
LocalidadRouter.patch('/:id', sanitizeLocalidadInput, update);
LocalidadRouter.delete('/:id', remove);

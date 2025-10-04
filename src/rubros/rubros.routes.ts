import { Router } from 'express';
import { sanitizeRubroInput, findAll, findOne, add, update, remove } from './rubros.controler.js';

export const RubrosRouter = Router();

RubrosRouter.get('/', findAll);
RubrosRouter.get('/:id', findOne);
RubrosRouter.post('/', sanitizeRubroInput, add);
RubrosRouter.put('/:id', sanitizeRubroInput, update);
RubrosRouter.patch('/:id', sanitizeRubroInput, update);
RubrosRouter.delete('/:id', remove);

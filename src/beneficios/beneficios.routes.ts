import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from '../personas/personas.controler.js';

export const BeneficiosRouter = Router();

BeneficiosRouter.get('/', findAll);
BeneficiosRouter.get('/:id', findOne);
BeneficiosRouter.post('/', sanitizePersonaInput, add);
BeneficiosRouter.put('/:id', sanitizePersonaInput, update);
BeneficiosRouter.patch('/:id', sanitizePersonaInput, update);
BeneficiosRouter.delete('/:id', remove);

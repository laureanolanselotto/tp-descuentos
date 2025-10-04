import { Router } from 'express';
import { sanitizeBeneficioInput, findAll, findOne, add, update, remove } from './beneficios.controler.js';

export const BeneficiosRouter = Router();

BeneficiosRouter.get('/', findAll);
BeneficiosRouter.get('/:id', findOne);
BeneficiosRouter.post('/', sanitizeBeneficioInput, add);
BeneficiosRouter.put('/:id', sanitizeBeneficioInput, update);
BeneficiosRouter.patch('/:id', sanitizeBeneficioInput, update);
BeneficiosRouter.delete('/:id', remove);

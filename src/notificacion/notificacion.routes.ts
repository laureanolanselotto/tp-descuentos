import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from '../personas/personas.controler.js';

export const NotificacionRouter = Router();

NotificacionRouter.get('/', findAll);
NotificacionRouter.get('/:id', findOne);
NotificacionRouter.post('/', sanitizePersonaInput, add);
NotificacionRouter.put('/:id', sanitizePersonaInput, update);
NotificacionRouter.patch('/:id', sanitizePersonaInput, update);
NotificacionRouter.delete('/:id', remove);

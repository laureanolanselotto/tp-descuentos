import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from '../personas/personas.controler.js';

export const WalletRouter = Router();

WalletRouter.get('/', findAll);
WalletRouter.get('/:id', findOne);
WalletRouter.post('/', sanitizePersonaInput, add);
WalletRouter.put('/:id', sanitizePersonaInput, update);
WalletRouter.patch('/:id', sanitizePersonaInput, update);
WalletRouter.delete('/:id', remove);

import { Router } from 'express';
import { sanitizeWalletInput, findAll, findOne, add, update, remove } from './wallet.controler.js';

export const WalletRouter = Router();

WalletRouter.get('/', findAll);
WalletRouter.get('/:id', findOne);
WalletRouter.post('/', sanitizeWalletInput, add);
WalletRouter.put('/:id', sanitizeWalletInput, update);
WalletRouter.patch('/:id', sanitizeWalletInput, update);
WalletRouter.delete('/:id', remove);

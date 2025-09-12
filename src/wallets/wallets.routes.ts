import { Router } from 'express';
import { controler } from './wallets.controler.js';

export const WalletsRouter = Router();

WalletsRouter.get('/', controler.findAll);
WalletsRouter.get('/:id', controler.findOne);
WalletsRouter.post('/', controler.sanitizeWalletInput, controler.add);
WalletsRouter.put('/:id', controler.sanitizeWalletInput, controler.uppdate);
WalletsRouter.patch('/:id', controler.sanitizeWalletInput, controler.uppdate);
WalletsRouter.delete('/:id', controler.remove);


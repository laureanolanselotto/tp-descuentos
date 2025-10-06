import { Router } from 'express';
import { sanitizeCiudadInput, findAll, findOne, add, update, remove } from './ciudad.controler.js';

export const CiudadRouter = Router();

CiudadRouter.get('/', findAll);
CiudadRouter.get('/:id', findOne);
CiudadRouter.post('/', sanitizeCiudadInput, add);
CiudadRouter.put('/:id', sanitizeCiudadInput, update);
CiudadRouter.patch('/:id', sanitizeCiudadInput, update);
CiudadRouter.delete('/:id', remove);
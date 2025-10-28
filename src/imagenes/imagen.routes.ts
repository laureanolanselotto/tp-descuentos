import { Router } from 'express';
import { add, findAll, findOne, findByNombre, sanitizeImagenInput } from './imagen.controller.js';
import { validatorSchema } from '../middlewares/validator.middleware.js';
import { createImagenSchema } from '../schema/imagen.validator.js';

export const ImagenRouter = Router();

ImagenRouter.get('/', findAll);
ImagenRouter.get('/buscar', findByNombre);
ImagenRouter.get('/:id', findOne);
ImagenRouter.post('/', validatorSchema(createImagenSchema), sanitizeImagenInput, add);

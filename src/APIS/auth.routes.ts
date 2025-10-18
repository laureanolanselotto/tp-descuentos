import { Router } from 'express';
import { login, logout, profile, verifyToken } from './auth.controler.js';
import { authRequiredToken } from '../middlewares/validenteToken.js';
import { validatorSchema } from '../middlewares/validator.middleware.js';
import { loginSchema } from '../schema/personas.validator.js';

export const AuthRouter = Router();

// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.post('/login', validatorSchema(loginSchema), login);
// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.post('/logout', logout);
// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.get('/profile', authRequiredToken, profile);

// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.get('/verify-token', verifyToken);

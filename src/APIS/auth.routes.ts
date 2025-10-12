import { Router } from 'express';
import { login,logout,profile } from './auth.controler.js';
import { authRequiredToken } from '../middlewares/validenteToken.js';
export const AuthRouter = Router();

// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.post('/login', login);
// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.post('/logout', logout);
// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.get('/profile', authRequiredToken, profile);

import { Router } from 'express';
import { login } from './auth.controler.js';

export const AuthRouter = Router();

// @ts-ignore - solución temporal para el problema de tipos de Express
AuthRouter.post('/login', login);
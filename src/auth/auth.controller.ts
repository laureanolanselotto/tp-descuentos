import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterUserDto, LoginUserDto } from './user.entity.js';

/**
 * Controlador de autenticación
 * 
 * Maneja las peticiones HTTP relacionadas con autenticación:
 * - POST /auth/register - Registrar nuevo usuario
 * - POST /auth/login - Iniciar sesión
 * - GET /auth/profile - Obtener perfil del usuario autenticado
 * - POST /auth/logout - Cerrar sesión (opcional)
 */
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Registra un nuevo usuario
   * POST /auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: RegisterUserDto = {
        email: req.body.email,
        password: req.body.password,
        nombre: req.body.nombre,
        apellido: req.body.apellido
      };

      const result = await this.authService.register(userData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Usuario registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Autentica un usuario existente
   * POST /auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginUserDto = {
        email: req.body.email,
        password: req.body.password
      };

      const result = await this.authService.login(loginData);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login exitoso'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene el perfil del usuario autenticado
   * GET /auth/profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // El middleware de autenticación debería haber agregado el usuario a req
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: user
        },
        message: 'Perfil obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cierra la sesión del usuario
   * POST /auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // En un sistema JWT stateless, el logout se maneja principalmente en el frontend
      // eliminando el token. Aquí solo confirmamos la operación.
      
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente. Elimine el token del cliente.'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint para verificar si un token es válido
   * POST /auth/verify
   */
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token requerido'
        });
        return;
      }

      const decoded = await this.authService.verifyToken(token);
      
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          decoded: decoded
        },
        message: 'Token válido'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        data: {
          valid: false
        },
        message: 'Token inválido o expirado'
      });
    }
  };
}

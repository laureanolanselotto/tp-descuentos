import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

/**
 * Middleware de autenticación
 * 
 * Verifica que el usuario esté autenticado mediante un token JWT válido.
 * Si el token es válido, agrega la información del usuario a req.user
 * Si no es válido, retorna un error 401.
 */
export class AuthMiddleware {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Middleware para verificar autenticación
   * Uso: router.get('/ruta-protegida', authMiddleware.authenticate, controller.method)
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Token de autenticación requerido'
        });
        return;
      }

      // Verificar formato del header (debe ser "Bearer <token>")
      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        res.status(401).json({
          success: false,
          message: 'Formato de token inválido. Use: Bearer <token>'
        });
        return;
      }

      const token = tokenParts[1];

      // Verificar y decodificar el token
      const decoded = await this.authService.verifyToken(token);
      
      // Obtener información completa del usuario
      const user = await this.authService.getUserById(decoded.id);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      if (!user.isActive()) {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
        });
        return;
      }

      // Agregar usuario a la request para uso en controllers
      (req as any).user = user.getPublicInfo();
      (req as any).token = token;

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  };

  /**
   * Middleware opcional de autenticación
   * No bloquea la request si no hay token, pero si hay uno lo valida
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        // No hay token, continuar sin autenticación
        next();
        return;
      }

      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        // Token mal formateado, continuar sin autenticación
        next();
        return;
      }

      const token = tokenParts[1];

      try {
        const decoded = await this.authService.verifyToken(token);
        const user = await this.authService.getUserById(decoded.id);
        
        if (user && user.isActive()) {
          (req as any).user = user.getPublicInfo();
          (req as any).token = token;
        }
      } catch (error) {
        // Token inválido, pero no bloqueamos la request
        console.warn('Token inválido en optionalAuth:', error);
      }

      next();
    } catch (error) {
      // Error inesperado, continuar sin autenticación
      console.error('Error en optionalAuth:', error);
      next();
    }
  };
}

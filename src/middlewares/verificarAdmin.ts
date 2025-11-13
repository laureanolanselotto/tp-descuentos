import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar si el usuario autenticado es admin
 * Debe usarse después de authRequiredToken
 */
export function verificarAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const persona = (req as any).persona;
    
    if (!persona) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    if (!persona.isAdmin) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    // El usuario es admin, continuar
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al verificar permisos de administrador',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

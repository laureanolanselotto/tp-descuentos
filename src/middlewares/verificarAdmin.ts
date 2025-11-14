import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { roles } from '../rol_personas/rol_personas.entity.js';
import { persona } from '../personas/personas.entity.js';

export async function verificarAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const em = orm.em.fork();
    const personaData = (req as any).persona;
    
    if (!personaData) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    // Verificar si tiene rol_persona = true (es admin)
    if (!personaData.rol_persona) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    // Validar que el email exista en la tabla de roles
    const rolExiste = await em.findOne(roles, { email_admins: personaData.email });

    // Si no está en roles, quitarle el permiso de admin
    if (!rolExiste) {
      await em.nativeUpdate(persona, { email: personaData.email }, { rol_persona: false });
      await em.flush();
      
      return res.status(403).json({ 
        message: 'Permisos de administrador revocados. Su cuenta ya no tiene acceso administrativo.' 
      });
    }

    // El usuario es admin y está en roles, continuar
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al verificar permisos de administrador',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

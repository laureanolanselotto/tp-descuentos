import { Request, Response, NextFunction } from 'express';
import { TOKEN_SECRET } from '../APIS/jwd.js';
import jwt from 'jsonwebtoken';
import { orm } from '../shared/db/orm.js';
import { persona } from '../personas/personas.entity.js';

// Extender el tipo Request para incluir decoded y persona
declare global {
  namespace Express {
    interface Request {
      decoded?: any;
      persona?: any;
    }
  }
}

async function authRequiredToken(req: Request, res: Response, next: NextFunction) {
   const { token } = req.cookies;
   
    if (!token) { 
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, TOKEN_SECRET);
        req.decoded = decoded;
        
        // Obtener la persona completa de la base de datos (SIEMPRE FRESCO, SIN CACHE)
        if (decoded && (decoded as any).id) {
          const em = orm.em.fork();
          // refresh: true fuerza a obtener los datos más recientes de la DB
          const personaData = await em.findOne(persona, { _id: (decoded as any).id }, { refresh: true });
          if (personaData) {
            req.persona = personaData;
            console.log('👤 Usuario autenticado:', personaData.email, '| rol_persona:', personaData.rol_persona);
          }
        }
        
        next();
    } catch (err: any) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

export { authRequiredToken };



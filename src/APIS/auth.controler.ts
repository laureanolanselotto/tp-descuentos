import e, { Request, Response, NextFunction } from 'express';
import { persona } from '../personas/personas.entity.js';
import { roles } from '../rol_personas/rol_personas.entity.js';
import { orm } from '../shared/db/orm.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from '@mikro-orm/mongodb';
import { TOKEN_SECRET } from './jwd.js';
import { decode } from 'punycode';
import { console } from 'inspector';

const em = orm.em;

// Función de login
async function login(req: Request, res: Response ) {
  try {
    const { email, password } = req.body;
    
    // Buscar persona por email - sin populate primero para verificar password
    const userFound = await em.findOne(persona, { email });
    
    if (!userFound) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Debug: Verificar que el password esté presente
    console.log('Password presente:', !!userFound.password);
    console.log('Password length:', userFound.password ? userFound.password.length : 0);
    
    if (!userFound.password) {
      console.error('ERROR: Password es undefined para el usuario:', email);
      return res.status(500).json({ message: 'Error: Password no encontrado en la base de datos' });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Ahora sí, cargar las relaciones (wallets y localidad)
    await em.populate(userFound, ['wallets', 'localidad']);
    
    //  Verificar si el usuario es admin desde el campo rol_persona
    const isAdmin = userFound.rol_persona || false;
    
    // Crear token
    const token = jwt.sign(
      { 
        id: userFound._id, 
        email: userFound.email,
        isAdmin: isAdmin 
      }, 
      TOKEN_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Guardar token en cookie
    res.cookie('token', token, {
      httpOnly: false, // Cambiado a false para permitir acceso desde el frontend
      secure: true, 
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 1 día
    });
    
    // Respuesta exitosa
    res.status(200).json({ 
      message: 'Login exitoso', 
      token,
      user: {
        _id: userFound._id,
        id: userFound.id,
        email: userFound.email,
        name: userFound.name,
        tel: userFound.tel,
        direccion: userFound.direccion,
        localidad: userFound.localidad,
        wallets: userFound.wallets,
        isAdmin: isAdmin
      }
    });
    
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

function logout(req: Request, res: Response) {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });

return res.status(200).json({ message: 'Logout exitoso', date: new Date() });
}


async function profile(req: Request, res: Response) {
  try {
    // Obtener el ID del usuario desde el token decodificado
    const userId = req.decoded?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    // Buscar el usuario en la base de datos
    const userFound = await em.findOne(persona, { _id: new ObjectId(userId) }, {
      populate: ['wallets', 'localidad']
    });
    
    if (!userFound) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Retornar perfil sin el password
    res.status(200).json({ 
      message: 'Perfil de usuario',
      id: userFound._id,
      email: userFound.email,
      name: userFound.name,
      wallets: userFound.wallets
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

{/* Verificar token */}
async function verifyToken(req: Request, res: Response) {
    const token = req.cookies.token 
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    try {
      const decoded = jwt.verify(token, TOKEN_SECRET) as any;
      const userFound = await em.findOne(persona, { _id: new ObjectId(decoded.id) }, { populate: ['wallets', 'localidad'] });
      if (!userFound) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      
      // Verificar si el usuario es admin desde el campo rol_persona
      const isAdmin = userFound.rol_persona || false;
      
      return res.status(200).json({ 
        message: 'Token válido',
        _id: userFound._id,
        id: userFound.id,
        name: userFound.name,
        email: userFound.email,
        tel: userFound.tel,
        direccion: userFound.direccion,
        localidad: userFound.localidad,
        wallets: userFound.wallets,
        isAdmin: isAdmin
      });
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  }
async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No autorizado - Token requerido' });

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET) as any;
    
    // Verificar desde el payload del token
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        message: 'Acceso denegado - Se requieren permisos de administrador' 
      });
    }

    // Usuario es admin según el token, continuar
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// Nueva función: Verificar estado de admin en tiempo real
async function checkAdminStatus(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No autorizado', isAdmin: false });

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET) as any;
    
    // Buscar la persona en la base de datos para obtener el estado actual
    const userFound = await em.findOne(persona, { _id: new ObjectId(decoded.id) });
    
    if (!userFound) {
      return res.status(404).json({ message: 'Usuario no encontrado', isAdmin: false });
    }
    
    // Verificar si el email existe en la tabla de roles
    const rolExiste = await em.findOne(roles, { email_admins: userFound.email });
    
    if (rolExiste) {
      // El email SÍ está en roles → ACTIVAR permisos de admin
      if (!userFound.rol_persona) {
        // Si no tenía permisos, otorgarlos
        userFound.rol_persona = true;
        await em.persistAndFlush(userFound);
        console.log('Permisos de administrador OTORGADOS para:', userFound.email);
        
        return res.status(200).json({ 
          message: 'Permisos de administrador otorgados',
          isAdmin: true,
          granted: true // Indica que se acaban de otorgar
        });
      }
      
      // Ya tenía permisos, todo está bien
      return res.status(200).json({ 
        message: 'Usuario es administrador',
        isAdmin: true 
      });
    } else {
      // El email NO está en roles → REVOCAR permisos de admin
      if (userFound.rol_persona) {
        // Si tenía permisos, revocarlos
        userFound.rol_persona = false;
        await em.persistAndFlush(userFound);
        console.log('Permisos de administrador REVOCADOS para:', userFound.email);
        
        return res.status(200).json({ 
          message: 'Permisos de administrador revocados',
          isAdmin: false,
          revoked: true // Indica que se acaban de revocar
        });
      }
      
      // No tenía permisos, todo está bien
      return res.status(200).json({ 
        message: 'Usuario no es administrador',
        isAdmin: false 
      });
    }
    
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido', isAdmin: false });
  }
}

export { login, logout, profile, verifyToken, verifyAdmin, checkAdminStatus };


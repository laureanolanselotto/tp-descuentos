import { Request, Response, } from 'express';
import { persona } from '../personas/personas.entity.js';
import { orm } from '../shared/db/orm.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const em = orm.em;

// Función de login
async function login(req: Request, res: Response ) {
  try {
    const { email, password } = req.body;
    
    // Buscar persona por email - sin populate para obtener el password
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
    
    // Crear token
    const token = jwt.sign(
      { id: userFound._id, email: userFound.email }, 
      'secretKey123', 
      { expiresIn: '1d' }
    );
    
    // Respuesta exitosa
    res.status(200).json({ 
      message: 'Login exitoso', 
      token,
      user: {
        id: userFound._id,
        email: userFound.email,
        name: userFound.name,
        wallet: userFound.wallets
      }
    });
    
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { login };
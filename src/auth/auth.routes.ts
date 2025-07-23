import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthMiddleware } from './auth.middleware.js';
import { UserMongoRepository } from './user.repository.mongo.js';

/**
 * Rutas de autenticación
 * 
 * Define todas las rutas relacionadas con autenticación:
 * - POST /auth/register - Registro de usuarios
 * - POST /auth/login - Inicio de sesión
 * - GET /auth/profile - Perfil del usuario (protegida)
 * - POST /auth/logout - Cerrar sesión
 * - POST /auth/verify - Verificar token
 */

// Crear instancias de las dependencias con MongoDB
const userRepository = new UserMongoRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(authService);

// Crear índices en MongoDB al inicializar
userRepository.createIndexes().catch(console.error);

// Crear router
const authRouter = Router();

/**
 * @route POST /auth/register
 * @desc Registrar un nuevo usuario
 * @access Público
 * @body {email, password, nombre, apellido}
 */
authRouter.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc Iniciar sesión
 * @access Público
 * @body {email, password}
 */
authRouter.post('/login', authController.login);

/**
 * @route GET /auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Privado (requiere token)
 * @headers Authorization: Bearer <token>
 */
authRouter.get('/profile', authMiddleware.authenticate, authController.getProfile);

/**
 * @route POST /auth/logout
 * @desc Cerrar sesión
 * @access Privado (requiere token)
 * @headers Authorization: Bearer <token>
 */
authRouter.post('/logout', authMiddleware.authenticate, authController.logout);

/**
 * @route POST /auth/verify
 * @desc Verificar si un token es válido
 * @access Público
 * @body {token} o @headers Authorization: Bearer <token>
 */
authRouter.post('/verify', authController.verifyToken);

/**
 * @route GET /auth/debug/users
 * @desc Ver todos los usuarios (solo para desarrollo)
 * @access Público (temporal)
 */
authRouter.get('/debug/users', async (req, res) => {
  try {
    const stats = await userRepository.getStats();
    const allUsers = await userRepository.findAll();
    
    // Remover contraseñas por seguridad
    const safeUsers = allUsers.map(user => ({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      fechaRegistro: user.fechaRegistro,
      activo: user.activo
    }));

    res.json({
      success: true,
      data: {
        stats: stats,
        users: safeUsers
      },
      message: 'Datos de usuarios obtenidos (modo debug)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Exportar router y dependencias para uso en otras partes de la aplicación
export { 
  authRouter, 
  authService, 
  authMiddleware, 
  userRepository as authUserRepository 
};

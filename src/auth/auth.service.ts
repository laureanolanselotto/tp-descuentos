import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, RegisterUserDto, LoginUserDto, AuthResponse } from './user.entity.js';
import { UserRepositoryInterface } from './user.repository.interface.js';

/**
 * Servicio de autenticación
 * 
 * Maneja todas las operaciones relacionadas con autenticación:
 * - Registro de usuarios
 * - Login/autenticación
 * - Generación y verificación de tokens JWT
 * - Hash y verificación de contraseñas
 */
export class AuthService {
  private userRepository: UserRepositoryInterface;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(userRepository: UserRepositoryInterface) {
    this.userRepository = userRepository;
    // En producción, estas deberían venir de variables de entorno
    this.jwtSecret = process.env.JWT_SECRET || 'tp-descuentos-secret-key-2025';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(userData: RegisterUserDto): Promise<AuthResponse> {
    try {
      // Verificar si ya existe un usuario con este email
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario registrado con este email');
      }

      // Validar datos de entrada
      this.validateRegistrationData(userData);

      // Hashear la contraseña
      const hashedPassword = await this.hashPassword(userData.password);

      // Crear el nuevo usuario
      const newUser = new User(
        '', // El repository asignará el ID
        userData.email.toLowerCase().trim(),
        hashedPassword,
        userData.nombre.trim(),
        userData.apellido.trim()
      );

      // Guardar en el repository
      const savedUser = await this.userRepository.add(newUser);
      if (!savedUser) {
        throw new Error('Error al crear el usuario');
      }

      // Generar token JWT
      const token = this.generateToken(savedUser);

      return {
        user: savedUser.getPublicInfo(),
        token,
        message: 'Usuario registrado exitosamente'
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error en el registro: ${error.message}`);
      }
      throw new Error('Error desconocido en el registro');
    }
  }

  /**
   * Autentica un usuario existente
   */
  async login(loginData: LoginUserDto): Promise<AuthResponse> {
    try {
      // Validar datos de entrada
      this.validateLoginData(loginData);

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(loginData.email);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar si el usuario está activo
      if (!user.isActive()) {
        throw new Error('Usuario inactivo. Contacte al administrador');
      }

      // Verificar contraseña
      const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token JWT
      const token = this.generateToken(user);

      return {
        user: user.getPublicInfo(),
        token,
        message: 'Login exitoso'
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error en el login: ${error.message}`);
      }
      throw new Error('Error desconocido en el login');
    }
  }

  /**
   * Verifica y decodifica un token JWT
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Obtiene un usuario por ID (para middleware de autenticación)
   */
  async getUserById(id: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ id });
  }

  /**
   * Genera un hash de la contraseña
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica una contraseña contra su hash
   */
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Genera un token JWT para un usuario
   */
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'tp-descuentos-app',
      audience: 'tp-descuentos-users'
    } as jwt.SignOptions);
  }

  /**
   * Valida los datos de registro
   */
  private validateRegistrationData(data: RegisterUserDto): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (!data.nombre || data.nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.apellido || data.apellido.trim().length < 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres');
    }
  }

  /**
   * Valida los datos de login
   */
  private validateLoginData(data: LoginUserDto): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (!data.password || data.password.length === 0) {
      throw new Error('La contraseña es requerida');
    }
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Entidad Usuario para el sistema de autenticación
 * 
 * Representa un usuario registrado en el sistema con capacidades de autenticación.
 * Incluye información básica del usuario y datos de seguridad para el login.
 */
export class User {
  constructor(
    public id: string,
    public email: string,
    public password: string, // Hash de la contraseña
    public nombre: string,
    public apellido: string,
    public fechaRegistro: Date = new Date(),
    public activo: boolean = true
  ) {}

  /**
   * Método para obtener información pública del usuario (sin contraseña)
   */
  public getPublicInfo() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      apellido: this.apellido,
      fechaRegistro: this.fechaRegistro,
      activo: this.activo
    };
  }

  /**
   * Método para verificar si el usuario está activo
   */
  public isActive(): boolean {
    return this.activo;
  }

  /**
   * Método para obtener el nombre completo del usuario
   */
  public getFullName(): string {
    return `${this.nombre} ${this.apellido}`;
  }
}

/**
 * DTO para registro de usuario
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

/**
 * DTO para login de usuario
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Interface para respuesta de autenticación
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
  };
  token: string;
  message: string;
}

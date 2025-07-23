import { Repository } from '../shared/repository.js';
import { User } from './user.entity.js';
import { UserRepositoryInterface } from './user.repository.interface.js';

/**
 * Repositorio en memoria para usuarios
 * 
 * Implementa las operaciones CRUD básicas para usuarios utilizando
 * almacenamiento en memoria. En un entorno de producción, esto debería
 * conectarse a una base de datos real.
 */
export class UserRepository implements UserRepositoryInterface {
  private users: User[] = [];
  private nextId: number = 1;

  /**
   * Busca todos los usuarios activos
   */
  async findAll(): Promise<User[]> {
    return this.users.filter(user => user.activo);
  }

  /**
   * Busca un usuario por ID
   */
  async findOne(params: {id: string}): Promise<User | undefined> {
    return this.users.find(user => user.id === params.id && user.activo);
  }

  /**
   * Busca un usuario por email
   * Método específico para autenticación
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Verifica si existe un usuario con el email dado
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Crea un nuevo usuario
   */
  async add(user: User): Promise<User> {
    // Verificar que no exista otro usuario con el mismo email
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    // Asignar ID si no tiene uno
    if (!user.id) {
      user.id = this.nextId.toString();
      this.nextId++;
    }

    this.users.push(user);
    return user;
  }

  /**
   * Actualiza un usuario existente
   */
  async update(user: User): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index === -1) {
      return undefined;
    }

    // Si se intenta cambiar el email, verificar que no exista otro usuario con ese email
    if (user.email !== this.users[index].email) {
      const existingUser = await this.findByEmail(user.email);
      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Ya existe un usuario con este email');
      }
    }

    // Actualizar el usuario
    this.users[index] = new User(
      user.id,
      user.email,
      user.password,
      user.nombre,
      user.apellido,
      user.fechaRegistro,
      user.activo
    );
    return this.users[index];
  }

  /**
   * Elimina (desactiva) un usuario
   */
  async delete(params: {id: string}): Promise<User | undefined> {
    const user = await this.findOne(params);
    if (user) {
      user.activo = false;
      return user;
    }
    return undefined;
  }

  /**
   * Método para obtener estadísticas de usuarios (útil para debugging)
   */
  async getStats() {
    return {
      total: this.users.length,
      activos: this.users.filter(u => u.activo).length,
      inactivos: this.users.filter(u => !u.activo).length
    };
  }
}

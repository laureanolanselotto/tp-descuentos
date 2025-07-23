import { Repository } from '../shared/repository.js';
import { User } from './user.entity.js';

/**
 * Interface específica para repositorios de usuarios
 * Extiende Repository<User> con métodos específicos para autenticación
 */
export interface UserRepositoryInterface extends Repository<User> {
  findByEmail(email: string): Promise<User | undefined>;
  existsByEmail(email: string): Promise<boolean>;
  getStats(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
  }>;
}

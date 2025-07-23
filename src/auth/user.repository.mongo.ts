import { Collection, ObjectId } from 'mongodb';
import { Repository } from '../shared/repository.js';
import { User } from './user.entity.js';
import { UserRepositoryInterface } from './user.repository.interface.js';
import { getDatabase } from '../shared/db/conn.js';

/**
 * Repositorio MongoDB para usuarios
 * 
 * Implementa las operaciones CRUD para usuarios utilizando MongoDB
 * como base de datos persistente. Reemplaza el repositorio en memoria.
 */
export class UserMongoRepository implements UserRepositoryInterface {
  private collection: Collection<any> | null = null;
  private readonly collectionName = 'users';

  /**
   * Obtiene la colección de usuarios (conecta si es necesario)
   */
  private async getCollection(): Promise<Collection<any>> {
    if (!this.collection) {
      const db = await getDatabase();
      this.collection = db.collection(this.collectionName);
      
      // Crear índice único para email
      try {
        await this.collection.createIndex({ email: 1 }, { unique: true });
        console.log(`� Índice único creado para email en colección ${this.collectionName}`);
      } catch (error) {
        console.log('📊 Índice para email ya existe');
      }
    }
    return this.collection;
  }

  /**
   * Busca todos los usuarios activos
   */
  async findAll(): Promise<User[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection.find({ activo: true }).toArray();
      return docs.map(doc => this.docToUser(doc));
    } catch (error) {
      console.error('Error en findAll:', error);
      throw new Error('Error al buscar usuarios');
    }
  }

  /**
   * Busca un usuario por ID
   */
  async findOne(params: {id: string}): Promise<User | undefined> {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne({ 
        _id: new ObjectId(params.id), 
        activo: true 
      });
      
      return doc ? this.docToUser(doc) : undefined;
    } catch (error) {
      console.error('Error en findOne:', error);
      return undefined;
    }
  }

  /**
   * Busca un usuario por email
   * Método específico para autenticación
   */
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne({ 
        email: email.toLowerCase() 
      });
      
      return doc ? this.docToUser(doc) : undefined;
    } catch (error) {
      console.error('Error en findByEmail:', error);
      return undefined;
    }
  }

  /**
   * Verifica si existe un usuario con el email dado
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const count = await collection.countDocuments({ 
        email: email.toLowerCase() 
      });
      return count > 0;
    } catch (error) {
      console.error('Error en existsByEmail:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async add(user: User): Promise<User | undefined> {
    try {
      const collection = await this.getCollection();
      
      // Verificar que no exista otro usuario con el mismo email
      const existingUser = await this.findByEmail(user.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Preparar documento para MongoDB
      const userDoc = {
        email: user.email.toLowerCase(),
        password: user.password,
        nombre: user.nombre,
        apellido: user.apellido,
        fechaRegistro: user.fechaRegistro,
        activo: user.activo
      };

      const result = await collection.insertOne(userDoc);
      
      if (result.insertedId) {
        // Retornar el usuario con el ID asignado por MongoDB
        return new User(
          result.insertedId.toString(),
          user.email,
          user.password,
          user.nombre,
          user.apellido,
          user.fechaRegistro,
          user.activo
        );
      }

      throw new Error('Error al insertar usuario');
    } catch (error) {
      console.error('Error en add:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async update(user: User): Promise<User | undefined> {
    try {
      const collection = await this.getCollection();
      
      // Si se intenta cambiar el email, verificar que no exista otro usuario con ese email
      if (user.email) {
        const existingUser = await this.findByEmail(user.email);
        if (existingUser && existingUser.id !== user.id) {
          throw new Error('Ya existe un usuario con este email');
        }
      }

      const updateDoc = {
        email: user.email.toLowerCase(),
        password: user.password,
        nombre: user.nombre,
        apellido: user.apellido,
        fechaRegistro: user.fechaRegistro,
        activo: user.activo
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(user.id) },
        { $set: updateDoc }
      );

      if (result.matchedCount > 0) {
        return user;
      }

      return undefined;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  /**
   * Elimina (desactiva) un usuario
   */
  async delete(params: {id: string}): Promise<User | undefined> {
    try {
      const user = await this.findOne(params);
      if (user) {
        user.activo = false;
        await this.update(user);
        return user;
      }
      return undefined;
    } catch (error) {
      console.error('Error en delete:', error);
      return undefined;
    }
  }

  /**
   * Método para obtener estadísticas de usuarios
   */
  async getStats() {
    try {
      const collection = await this.getCollection();
      const total = await collection.countDocuments({});
      const activos = await collection.countDocuments({ activo: true });
      const inactivos = await collection.countDocuments({ activo: false });

      return {
        total,
        activos,
        inactivos
      };
    } catch (error) {
      console.error('Error en getStats:', error);
      return {
        total: 0,
        activos: 0,
        inactivos: 0
      };
    }
  }

  /**
   * Convierte un documento de MongoDB a una instancia de User
   */
  private docToUser(doc: any): User {
    return new User(
      doc._id.toString(),
      doc.email,
      doc.password,
      doc.nombre,
      doc.apellido,
      doc.fechaRegistro,
      doc.activo
    );
  }

  /**
   * Método para limpiar la colección (útil para testing)
   */
  async clearAll(): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.deleteMany({});
      console.log('🗑️ Colección de usuarios limpiada');
    } catch (error) {
      console.error('Error al limpiar colección:', error);
      throw error;
    }
  }

  /**
   * Método para crear índices necesarios
   */
  async createIndexes(): Promise<void> {
    try {
      const collection = await this.getCollection();
      // Índice único para email
      await collection.createIndex({ email: 1 }, { unique: true });
      
      // Índice para consultas por estado activo
      await collection.createIndex({ activo: 1 });
      
      console.log('📊 Índices creados para colección users');
    } catch (error) {
      console.error('Error al crear índices:', error);
      // No lanzamos error para que no falle la aplicación
    }
  }
}

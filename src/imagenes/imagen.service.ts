import { ObjectId } from '@mikro-orm/mongodb';
import { Imagen } from './imagen.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

export interface CreateImagenInput {
  url: string;
  nombre: string;
}

export class ImagenService {
  static async findAll() {
    return em.find(Imagen, {});
  }

  static async findById(id: string) {
    const imagenByStringId = await em.findOne(Imagen, { id });
    if (imagenByStringId) {
      return imagenByStringId;
    }

    if (ObjectId.isValid(id)) {
      const imagenByObjectId = await em.findOne(Imagen, { _id: new ObjectId(id) });
      if (imagenByObjectId) {
        return imagenByObjectId;
      }
    }

    return null;
  }

  static async findByIdOrFail(id: string) {
    const imagen = await this.findById(id);
    if (!imagen) {
      throw new Error('Imagen not found');
    }
    return imagen;
  }

  static async create(input: CreateImagenInput) {
    const imagen = em.create(Imagen, input);
    await em.persistAndFlush(imagen);
    return imagen;
  }
}

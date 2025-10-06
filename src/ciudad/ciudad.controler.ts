import { Request, Response, NextFunction } from 'express';
import { Ciudad } from './ciudad.entity.js';
import { Localidad } from '../localidad/localidad.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeCiudadInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombreCiudad: req.body.nombreCiudad,
    codigoPostal: req.body.codigoPostal,
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    localidadId: req.body.localidadId || req.body.localidad,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// Obtener todas las ciudades con sus relaciones
async function findAll(_req: Request, res: Response) {
  try {
    const ciudades = await em.find(Ciudad, {}, { populate: ['localidad', 'personas'] });
    res.status(200).json({ message: 'found all ciudades', data: ciudades });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener una ciudad por ID
async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let ciudadFound;
    try {
      ciudadFound = await em.findOneOrFail(Ciudad, { id }, { populate: ['localidad', 'personas'] });
    } catch (e) {
      try {
        ciudadFound = await em.findOneOrFail(Ciudad, { _id: new ObjectId(id) }, { populate: ['localidad', 'personas'] });
      } catch (err) {
        throw err;
      }
    }
    res.status(200).json({ message: 'found ciudad', data: ciudadFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Crear una nueva ciudad
async function add(req: Request, res: Response) {
  try {
    // Validar que localidadId está presente
    if (!req.body.sanitizedInput.localidadId) {
      res.status(400).json({ message: 'localidadId is required' });
      return;
    }

    // Crear el payload con referencias
    const payload = { ...req.body.sanitizedInput };
    payload.localidad = em.getReference(Localidad, req.body.sanitizedInput.localidadId);
    delete payload.localidadId;

    const ciudadCreated = em.create(Ciudad, payload);
    await em.flush();
    res.status(201).json({ message: 'ciudad created', data: ciudadCreated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una ciudad existente
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let ciudadToUpdate;
    try {
      ciudadToUpdate = await em.findOneOrFail(Ciudad, { id });
    } catch (e) {
      ciudadToUpdate = await em.findOneOrFail(Ciudad, { _id: new ObjectId(id) });
    }

    // Crear el payload para la actualización
    const payload = { ...req.body.sanitizedInput };
    
    // Si localidadId está presente, crear la referencia
    if (req.body.sanitizedInput.localidadId) {
      payload.localidad = em.getReference(Localidad, req.body.sanitizedInput.localidadId);
      delete payload.localidadId;
    }

    em.assign(ciudadToUpdate, payload);
    await em.flush();
    res.status(200).json({ message: 'ciudad updated', data: ciudadToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Eliminar una ciudad
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let ciudadToRemove;
    try {
      ciudadToRemove = await em.findOneOrFail(Ciudad, { id });
    } catch (e) {
      ciudadToRemove = await em.findOneOrFail(Ciudad, { _id: new ObjectId(id) });
    }
    await em.removeAndFlush(ciudadToRemove);
    res.status(200).send({ message: 'ciudad deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeCiudadInput, findAll, findOne, add, update, remove };
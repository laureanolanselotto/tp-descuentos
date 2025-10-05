import { Request, Response, NextFunction } from 'express';
import { localidad } from './localidad.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeLocalidadInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    coordenadas: req.body.coordenadas,
    calles: req.body.calles,
    numero_calle: req.body.numero_calle,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function findAll(_req: Request, res: Response) {
  try {
    const localidades = await em.find(localidad, {});
    res.status(200).json({ message: 'found all localidades', data: localidades });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let localidadFound;
    try {
      localidadFound = await em.findOneOrFail(localidad, { id });
    } catch (e) {
      localidadFound = await em.findOneOrFail(localidad, { _id: new ObjectId(id) });
    }
    res.status(200).json({ message: 'found localidad', data: localidadFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const localidadCreated = em.create(localidad, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'localidad created', data: localidadCreated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let localidadToUpdate;
    try {
      localidadToUpdate = await em.findOneOrFail(localidad, { id });
    } catch (e) {
      localidadToUpdate = await em.findOneOrFail(localidad, { _id: new ObjectId(id) });
    }
    em.assign(localidadToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'localidad updated', data: localidadToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let localidadToRemove;
    try {
      localidadToRemove = await em.findOneOrFail(localidad, { id });
    } catch (e) {
      localidadToRemove = await em.findOneOrFail(localidad, { _id: new ObjectId(id) });
    }
    await em.removeAndFlush(localidadToRemove);
    res.status(200).send({ message: 'localidad deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeLocalidadInput, findAll, findOne, add, update, remove };

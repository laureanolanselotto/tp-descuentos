import { Request, Response, NextFunction } from 'express';
import { Notificacion } from './notificacion.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeNotificacionInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    apellido: req.body.apellido,
    email: req.body.email,
    tel: req.body.tel,
    dni: req.body.dni,
    personaClass: req.body.personaClass,
    items: req.body.items,
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
    const notificaciones = await em.find(Notificacion, {});
    res.status(200).json({ message: 'found all notificaciones', data: notificaciones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let notificacionFound;
    try {
      notificacionFound = await em.findOneOrFail(Notificacion, { id });
    } catch (e) {
      notificacionFound = await em.findOneOrFail(Notificacion, { _id: new ObjectId(id) });
    }
    res.status(200).json({ message: 'found notificacion', data: notificacionFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const notificacionCreated = em.create(Notificacion, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'notificacion created', data: notificacionCreated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let notificacionToUpdate;
    try {
      notificacionToUpdate = await em.findOneOrFail(Notificacion, { id });
    } catch (e) {
      notificacionToUpdate = await em.findOneOrFail(Notificacion, { _id: new ObjectId(id) });
    }
    em.assign(notificacionToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'notificacion updated', data: notificacionToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let notificacionToRemove;
    try {
      notificacionToRemove = await em.findOneOrFail(Notificacion, { id });
    } catch (e) {
      notificacionToRemove = await em.findOneOrFail(Notificacion, { _id: new ObjectId(id) });
    }
    await em.removeAndFlush(notificacionToRemove);
    res.status(200).send({ message: 'notificacion deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeNotificacionInput, findAll, findOne, add, update, remove };

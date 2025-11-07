import { Request, Response, NextFunction } from 'express';
import { roles } from './rol_personas.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeRolesInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    email_admins: req.body.email_admins,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// Obtener todos los roles
async function findAll(_req: Request, res: Response) {
  try {
    const rolesFound = await em.find(roles, {});
    res.status(200).json({ message: 'found all roles', data: rolesFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let rolesFound;
    try {
      rolesFound = await em.findOneOrFail(roles, { id });
    } catch (e) {
      try {
        rolesFound = await em.findOneOrFail(roles, { _id: new ObjectId(id) });
      } catch (err) {
        throw err;
      }
    }
    res.status(200).json({ message: 'found roles', data: rolesFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Crear una nueva ciudad
async function add(req: Request, res: Response) {
  try {
    // Crear la entidad
    const rolesCreated = em.create(roles, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'roles created', data: rolesCreated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una ciudad existente
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let rolesToUpdate;
    try {
      rolesToUpdate = await em.findOneOrFail(roles, { id });
    } catch (e) {
      rolesToUpdate = await em.findOneOrFail(roles, { _id: new ObjectId(id) });
    }

    em.assign(rolesToUpdate, req.body.sanitizedInput);
    await em.flush();

    res.status(200).json({ message: 'roles updated', data: rolesToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Eliminar una ciudad
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let rolesToRemove;
    try {
      rolesToRemove = await em.findOneOrFail(roles, { id });
    } catch (e) {
      rolesToRemove = await em.findOneOrFail(roles, { _id: new ObjectId(id) });
    }
    await em.removeAndFlush(rolesToRemove);
    res.status(200).send({ message: 'roles deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeRolesInput, findAll, findOne, add, update, remove };
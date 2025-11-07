import { Request, Response, NextFunction } from 'express';
import { Sucursal } from './sucursal.entity.js';
import { Ciudad } from '../ciudad/ciudad.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeSucursalInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    telefono: req.body.telefono,
    email_contacto: req.body.email_contacto,
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    direccion: req.body.direccion,
    alias: req.body.alias,
    ciudadId: req.body.ciudadId || req.body.ciudad,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// Obtener todas las sucursales con sus relaciones
async function findAll(_req: Request, res: Response) {
  try {
    const sucursales = await em.find(Sucursal, {}, { populate: ['ciudad'] });
    res.status(200).json({ message: 'found all sucursales', data: sucursales });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener una sucursal por ID
async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let sucursalFound;
    try {
      sucursalFound = await em.findOneOrFail(Sucursal, { id }, { populate: ['ciudad'] });
    } catch (e) {
      try {
        sucursalFound = await em.findOneOrFail(Sucursal, { _id: new ObjectId(id) }, { populate: ['ciudad'] });
      } catch (err) {
        throw err;
      }
    }
    res.status(200).json({ message: 'found sucursal', data: sucursalFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Crear una nueva sucursal
async function add(req: Request, res: Response) {
  try {
    // Validar que ciudadId está presente
    if (!req.body.sanitizedInput.ciudadId) {
      res.status(400).json({ message: 'ciudadId is required' });
      return;
    }

    // Buscar la ciudad usando ObjectId
    const ciudadId = req.body.sanitizedInput.ciudadId;
    const ciudadFound = await em.findOne(Ciudad, { _id: new ObjectId(ciudadId) });
    
    if (!ciudadFound) {
      res.status(400).json({ message: 'Ciudad not found with provided ciudadId' });
      return;
    }

    // Crear el payload con la entidad encontrada
    const payload = { ...req.body.sanitizedInput };
    payload.ciudad = ciudadFound;
    delete payload.ciudadId;

    const sucursalCreated = em.create(Sucursal, payload);
    await em.flush();
    
    // Recargar con relaciones pobladas
    const sucursalWithRelations = await em.findOne(Sucursal, { _id: sucursalCreated._id }, { 
      populate: ['ciudad'] 
    });
    
    res.status(201).json({ message: 'sucursal created', data: sucursalWithRelations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una sucursal existente
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let sucursalToUpdate;
    try {
      sucursalToUpdate = await em.findOneOrFail(Sucursal, { id }, { populate: ['ciudad'] });
    } catch (e) {
      sucursalToUpdate = await em.findOneOrFail(Sucursal, { _id: new ObjectId(id) }, { populate: ['ciudad'] });
    }

    // Crear el payload para la actualización
    const payload = { ...req.body.sanitizedInput };
    
    // Si ciudadId está presente, buscar la ciudad usando ObjectId
    if (req.body.sanitizedInput.ciudadId) {
      const ciudadId = req.body.sanitizedInput.ciudadId;
      const ciudadFound = await em.findOne(Ciudad, { _id: new ObjectId(ciudadId) });
      
      if (!ciudadFound) {
        res.status(400).json({ message: 'Ciudad not found with provided ciudadId' });
        return;
      }
      
      payload.ciudad = ciudadFound;
      delete payload.ciudadId;
    }

    em.assign(sucursalToUpdate, payload);
    await em.flush();
    
    // Recargar con relaciones pobladas
    const sucursalUpdated = await em.findOne(Sucursal, { _id: sucursalToUpdate._id }, { 
      populate: ['ciudad'] 
    });
    
    res.status(200).json({ message: 'sucursal updated', data: sucursalUpdated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Eliminar una sucursal
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let sucursalToRemove;
    try {
      sucursalToRemove = await em.findOneOrFail(Sucursal, { id });
    } catch (e) {
      sucursalToRemove = await em.findOneOrFail(Sucursal, { _id: new ObjectId(id) });
    }
    await em.removeAndFlush(sucursalToRemove);
    res.status(200).send({ message: 'sucursal deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeSucursalInput, findAll, findOne, add, update, remove };

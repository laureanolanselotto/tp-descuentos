import { Request, Response, NextFunction } from 'express';
import { UbicacionUsuario } from './ubicacion_usuario.entity.js';
import { persona } from '../personas/personas.entity.js';
import { Ciudad } from '../ciudad/ciudad.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeUbicacionUsuarioInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    direccion: req.body.direccion,
    alias: req.body.alias,
    activa: req.body.activa,
    precision_metros: req.body.precision_metros,
    personaId: req.body.personaId || req.body.persona,
    ciudadId: req.body.ciudadId || req.body.ciudad,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// Obtener todas las ubicaciones de usuario con sus relaciones
async function findAll(_req: Request, res: Response) {
  try {
    const ubicaciones = await em.find(UbicacionUsuario, {}, { populate: ['persona', 'ciudad'] });
    res.status(200).json({ message: 'found all ubicaciones usuario', data: ubicaciones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener una ubicación de usuario por ID
async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let ubicacionFound;
    try {
      ubicacionFound = await em.findOneOrFail(UbicacionUsuario, { id }, { populate: ['persona', 'ciudad'] });
    } catch (e) {
      try {
        ubicacionFound = await em.findOneOrFail(UbicacionUsuario, { _id: new ObjectId(id) }, { populate: ['persona', 'ciudad'] });
      } catch (err) {
        throw err;
      }
    }
    res.status(200).json({ message: 'found ubicacion usuario', data: ubicacionFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Crear una nueva ubicación de usuario
async function add(req: Request, res: Response) {
  try {
    // Validar que personaId y ciudadId están presentes
    if (!req.body.sanitizedInput.personaId) {
      res.status(400).json({ message: 'personaId is required' });
      return;
    }
    if (!req.body.sanitizedInput.ciudadId) {
      res.status(400).json({ message: 'ciudadId is required' });
      return;
    }

    // Buscar la persona usando ObjectId
    const personaId = req.body.sanitizedInput.personaId;
    const personaFound = await em.findOne(persona, { _id: new ObjectId(personaId) });
    
    if (!personaFound) {
      res.status(400).json({ message: 'Persona not found with provided personaId' });
      return;
    }

    // Buscar la ciudad usando ObjectId
    const ciudadId = req.body.sanitizedInput.ciudadId;
    const ciudadFound = await em.findOne(Ciudad, { _id: new ObjectId(ciudadId) });
    
    if (!ciudadFound) {
      res.status(400).json({ message: 'Ciudad not found with provided ciudadId' });
      return;
    }

    // Crear el payload con las entidades encontradas
    const payload = { ...req.body.sanitizedInput };
    payload.persona = personaFound;
    payload.ciudad = ciudadFound;
    delete payload.personaId;
    delete payload.ciudadId;

    const ubicacionCreated = em.create(UbicacionUsuario, payload);
    await em.flush();
    
    // Recargar con relaciones pobladas
    const ubicacionWithRelations = await em.findOne(UbicacionUsuario, { _id: ubicacionCreated._id }, { 
      populate: ['persona', 'ciudad'] 
    });
    
    res.status(201).json({ message: 'ubicacion usuario created', data: ubicacionWithRelations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una ubicación de usuario existente
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let ubicacionToUpdate;
    try {
      ubicacionToUpdate = await em.findOneOrFail(UbicacionUsuario, { id }, { populate: ['persona', 'ciudad'] });
    } catch (e) {
      ubicacionToUpdate = await em.findOneOrFail(UbicacionUsuario, { _id: new ObjectId(id) }, { populate: ['persona', 'ciudad'] });
    }

    // Crear el payload para la actualización
    const payload = { ...req.body.sanitizedInput };
    
    // Si personaId está presente, buscar la persona usando ObjectId
    if (req.body.sanitizedInput.personaId) {
      const personaId = req.body.sanitizedInput.personaId;
      const personaFound = await em.findOne(persona, { _id: new ObjectId(personaId) });
      
      if (!personaFound) {
        res.status(400).json({ message: 'Persona not found with provided personaId' });
        return;
      }
      
      payload.persona = personaFound;
      delete payload.personaId;
    }

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

    em.assign(ubicacionToUpdate, payload);
    await em.flush();
    
    // Recargar con relaciones pobladas
    const ubicacionUpdated = await em.findOne(UbicacionUsuario, { _id: ubicacionToUpdate._id }, { 
      populate: ['persona', 'ciudad'] 
    });
    
    res.status(200).json({ message: 'ubicacion usuario updated', data: ubicacionUpdated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Eliminar una ubicación de usuario
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let ubicacionToRemove;
    try {
      ubicacionToRemove = await em.findOneOrFail(UbicacionUsuario, { id });
    } catch (e) {
      ubicacionToRemove = await em.findOneOrFail(UbicacionUsuario, { _id: new ObjectId(id) });
    }
    await em.removeAndFlush(ubicacionToRemove);
    res.status(200).send({ message: 'ubicacion usuario deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeUbicacionUsuarioInput, findAll, findOne, add, update, remove };

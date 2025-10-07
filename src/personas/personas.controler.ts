import { Request, Response, NextFunction } from 'express'
import { persona } from './personas.entity.js'
import { Ciudad } from '../ciudad/ciudad.entity.js'
import { Wallet } from '../wallet/wallet.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from '@mikro-orm/mongodb'

const em = orm.em

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {

  req.body.sanitizedInput = {
    name: req.body.name,
    apellido: req.body.apellido,
    email: req.body.email,
    tel: req.body.tel,
    dni: req.body.dni,
    direccion: req.body.direccion,
    wallets: req.body.wallets,
    ciudadId: req.body.ciudadId || req.body.ciudad
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })


  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const personas = await em.find(persona, {}, { populate: ['wallets', 'ciudad'] })
    res.status(200).json({ message: 'found all personas', data: personas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    let personaFound
    try {
      personaFound = await em.findOneOrFail(persona, { id }, { populate: ['wallets', 'ciudad'] })
    } catch (e) {
      // try by ObjectId in _id
      try {
        personaFound = await em.findOneOrFail(persona, { _id: new ObjectId(id) }, { populate: ['wallets', 'ciudad'] })
      } catch (err) {
        throw err
      }
    }
    res.status(200).json({ message: 'found persona', data: personaFound })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const payload = { ...req.body.sanitizedInput };
    
    // Manejar relación con ciudad usando ObjectId
    if (req.body.sanitizedInput.ciudadId) {
      // Convertir string ID a ObjectId para la búsqueda
      const ciudadId = req.body.sanitizedInput.ciudadId;
      const ciudadFound = await em.findOne(Ciudad, { _id: new ObjectId(ciudadId) });
      
      if (!ciudadFound) {
        res.status(400).json({ message: 'Ciudad not found with provided ciudadId' });
        return;
      }
      
      // Usar el ObjectId para la relación
      payload.ciudad = ciudadFound;
      delete payload.ciudadId;
    }
    
    const personaCreated = em.create(persona, payload);
    
    // Manejar relación ManyToMany con wallets usando ObjectId
    if (req.body.sanitizedInput.wallets && Array.isArray(req.body.sanitizedInput.wallets)) {
      for (const walletIdString of req.body.sanitizedInput.wallets) {
        const walletFound = await em.findOne(Wallet, { _id: new ObjectId(walletIdString) });
        
        if (!walletFound) {
          res.status(400).json({ message: `Wallet not found with id: ${walletIdString}` });
          return;
        }
        
        personaCreated.wallets.add(walletFound);
      }
    }
    
    await em.flush();
    
    // Recargar la persona con las relaciones pobladas
    const personaWithRelations = await em.findOne(persona, { _id: personaCreated._id }, { 
      populate: ['wallets', 'ciudad'] 
    });
    
    res.status(201).json({ message: 'persona created', data: personaWithRelations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let personaToUpdate;
    
    try {
      personaToUpdate = await em.findOneOrFail(persona, { id }, { populate: ['wallets'] });
    } catch (e) {
      personaToUpdate = await em.findOneOrFail(persona, { _id: new ObjectId(id) }, { populate: ['wallets'] });
    }
    
    const payload = { ...req.body.sanitizedInput };
    
    // Manejar relación con ciudad usando ObjectId
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
    
    // Manejar relación ManyToMany con wallets
    if (req.body.sanitizedInput.wallets && Array.isArray(req.body.sanitizedInput.wallets)) {
      personaToUpdate.wallets.removeAll();
      
      for (const walletIdString of req.body.sanitizedInput.wallets) {
        const walletFound = await em.findOne(Wallet, { _id: new ObjectId(walletIdString) });
        
        if (!walletFound) {
          res.status(400).json({ message: `Wallet not found with id: ${walletIdString}` });
          return;
        }
        
        personaToUpdate.wallets.add(walletFound);
      }
    }
    
    delete payload.wallets;
    em.assign(personaToUpdate, payload);
    await em.flush();
    
    // Recargar con relaciones pobladas
    const personaUpdated = await em.findOne(persona, { _id: personaToUpdate._id }, { 
      populate: ['wallets', 'ciudad'] 
    });
    
    res.status(200).json({ message: 'persona updated', data: personaUpdated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    let personaToRemove
    try {
      personaToRemove = await em.findOneOrFail(persona, { id })
    } catch (e) {
      personaToRemove = await em.findOneOrFail(persona, { _id: new ObjectId(id) })
    }
    await em.removeAndFlush(personaToRemove)
    res.status(200).send({ message: 'persona deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizePersonaInput, findAll, findOne, add, update, remove }
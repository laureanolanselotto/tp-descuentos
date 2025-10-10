import { Request, Response ,NextFunction} from 'express'
import { persona } from './personas.entity.js'
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
    localidad: req.body.localidad,
    notificaciones: req.body.notificaciones
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
    const personas = await em.find(persona, {}, { populate: ['wallets', 'localidad','notificaciones'] })
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
      personaFound = await em.findOneOrFail(persona, { id }, { populate: ['wallets', 'localidad','notificaciones'] })
    } catch (e) {
      // try by ObjectId in _id
      try {
        personaFound = await em.findOneOrFail(persona, { _id: new ObjectId(id) }, { populate: ['wallets', 'localidad','notificaciones'] })
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
     const input = { ...req.body.sanitizedInput }
     
     // Convertir IDs de wallets y localidad a ObjectId
     if (input.wallets && Array.isArray(input.wallets)) {
       input.wallets = input.wallets.map((walletId: string) => new ObjectId(walletId))
     }
     if (input.localidad) {
       input.localidad = new ObjectId(input.localidad)
     }
     
     const personaCreated = em.create(persona, input);
     await em.flush();
     
     // Recargar con relaciones pobladas
     const personaWithRelations = await em.findOne(persona, { _id: personaCreated._id }, {
       populate: ['wallets', 'localidad']
     })

     res.status(201).json({ message: 'persona created', data: personaWithRelations });
   } catch (error: any) {
     res.status(500).json({ message: error.message });
   }
 }
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const input = { ...req.body.sanitizedInput }
    
    // Convertir IDs de wallets y localidad a ObjectId
    if (input.wallets && Array.isArray(input.wallets)) {
      input.wallets = input.wallets.map((walletId: string) => new ObjectId(walletId))
    }
    if (input.localidad) {
      input.localidad = new ObjectId(input.localidad)
    }
    
    const personaToUpdate = await em.findOneOrFail(persona, { id })
    em.assign(personaToUpdate, input)
    await em.flush()
    res
      .status(200)
      .json({ message: 'persona updated', data: personaToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
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

export {sanitizePersonaInput, findAll, findOne, add, update, remove }
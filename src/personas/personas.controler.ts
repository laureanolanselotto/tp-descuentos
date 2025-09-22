import { Request, Response, NextFunction } from 'express'
import { persona } from './personas.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        name: req.body.name,
        apellido: req.body.apellido,
        email: req.body.email,
        tel: req.body.tel,
        dni: req.body.dni,
        personaClass: req.body.personaClass,
        items: req.body.items,
    };
    // Elimina los campos undefined
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

async function findAll(req: Request, res: Response) {
  try {
    const personas = await em.find(
      persona,
      {},
      { populate: ['personaClass', 'items'] }
    )
    res.status(200).json({ message: 'found all personas', data: personas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const personaFound = await em.findOneOrFail(
      persona,
      { id },
      { populate: ['personaClass', 'items'] }
    )
    res.status(200).json({ message: 'found persona', data: personaFound })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const personaCreated = em.create(persona, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'persona created', data: personaCreated })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const personaToUpdate = await em.findOneOrFail(persona, { id })
    em.assign(personaToUpdate, req.body.sanitizedInput)
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
    const personaRef = em.getReference(persona, id)
    await em.removeAndFlush(personaRef)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


export  {sanitizePersonaInput ,findAll,findOne,add, update, remove};

//export {sanitizePersonaInput ,findAll, findOne, repository as PersonasRepository}

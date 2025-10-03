import { Request, Response, NextFunction } from 'express'
import { persona } from '../personas/personas.entity.js'
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
    personaClass: req.body.personaClass,
    items: req.body.items,
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
    const personas = await em.find(persona, {}, { populate: ['personaClass', 'items'] })
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
      personaFound = await em.findOneOrFail(persona, { id }, { populate: ['personaClass', 'items'] })
    } catch (e) {
      // try by ObjectId in _id
      try {
        personaFound = await em.findOneOrFail(persona, { _id: new ObjectId(id) }, { populate: ['personaClass', 'items'] })
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
    let personaToUpdate
    try {
      personaToUpdate = await em.findOneOrFail(persona, { id })
    } catch (e) {
      personaToUpdate = await em.findOneOrFail(persona, { _id: new ObjectId(id) })
    }
    em.assign(personaToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'persona updated', data: personaToUpdate })
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

export { sanitizePersonaInput, findAll, findOne, add, update, remove }

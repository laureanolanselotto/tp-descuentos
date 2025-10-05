/*import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { personaClass } from './personasClass.entity.js'

const em = orm.em

async function findAll(req: Request, res: Response) {
  try {
    const personaClasses = await em.find(personaClass, {})
    res
      .status(200)
      .json({ message: 'found all personas classes', data: personaClasses })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const personaClassFound = await em.findOneOrFail(personaClass, { id })
    res
      .status(200)
      .json({ message: 'found personas class', data: personaClassFound })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const personaClassCreated = em.create(personaClass, req.body)
    await em.flush()
    res
      .status(201)
      .json({ message: 'personas class created', data: personaClassCreated })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const personaClassToUpdate = await em.findOneOrFail(personaClass, { id })
    em.assign(personaClassToUpdate, req.body)
    await em.flush()
    res
      .status(200)
      .json({ message: 'personas class updated', data: personaClassToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const personaClassToRemove = await em.findOneOrFail(personaClass, { id })
    await em.removeAndFlush(personaClassToRemove)
    res.status(200).send({ message: 'personas class deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove }*/
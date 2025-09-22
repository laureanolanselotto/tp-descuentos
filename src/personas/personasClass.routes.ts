import { Router } from 'express'
import {
  findAll,
  findOne,
  add,
  update,
  remove,
} from './personasClass.Controler.js'

export const personasClassesRouter = Router()

personasClassesRouter.get('/', findAll)
personasClassesRouter.get('/:id', findOne)
personasClassesRouter.post('/', add)
personasClassesRouter.put('/:id', update)
personasClassesRouter.delete('/:id', remove)
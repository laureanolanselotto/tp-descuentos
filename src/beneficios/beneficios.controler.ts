import { Request, Response, NextFunction } from 'express'
import { Beneficio } from './beneficios.entity.js'
import { Wallet } from '../wallet/wallet.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from '@mikro-orm/mongodb'

const em = orm.em

function sanitizeBeneficioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    name: req.body.name,
    discount: req.body.discount,
    discountType: req.body.discountType,
    icon: req.body.icon,
    category: req.body.category,
    walletId: req.body.walletId,
    availableDays: req.body.availableDays,
    validity: req.body.validity,
    fecha_desde: req.body.fecha_desde,
    fecha_hasta: req.body.fecha_hasta,
    limit: req.body.limit,
    tope_reintegro: req.body.tope_reintegro,
    imageUrl: req.body.imageUrl,
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
  const beneficios = await em.find(Beneficio, {}, { populate: ['wallet'] })
  res.status(200).json({ message: 'found all beneficios', data: beneficios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    let beneficioFound
    try {
  beneficioFound = await em.findOneOrFail(Beneficio, { id }, { populate: ['wallet'] })
    } catch (e) {
      // try by ObjectId in _id
      try {
  beneficioFound = await em.findOneOrFail(Beneficio, { _id: new ObjectId(id) }, { populate: ['wallet'] })
      } catch (err) {
        throw err
      }
    }
    res.status(200).json({ message: 'found beneficio', data: beneficioFound })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = { ...req.body.sanitizedInput }
    if (input.walletId) {
      // set relation to wallet
      input.wallet = em.getReference(Wallet, input.walletId)
      delete input.walletId
    }
    const beneficioCreated = em.create(Beneficio, input)
    await em.flush()
    res.status(201).json({ message: 'beneficio created', data: beneficioCreated })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    let beneficioToUpdate
    try {
      beneficioToUpdate = await em.findOneOrFail(Beneficio, { id })
    } catch (e) {
      beneficioToUpdate = await em.findOneOrFail(Beneficio, { _id: new ObjectId(id) })
    }
    const input = { ...req.body.sanitizedInput }
    if (input.walletId) {
      input.wallet = em.getReference(Wallet, input.walletId)
      delete input.walletId
    }
    em.assign(beneficioToUpdate, input)
    await em.flush()
    res.status(200).json({ message: 'beneficio updated', data: beneficioToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    let beneficioToRemove
    try {
      beneficioToRemove = await em.findOneOrFail(Beneficio, { id })
    } catch (e) {
      beneficioToRemove = await em.findOneOrFail(Beneficio, { _id: new ObjectId(id) })
    }
    await em.removeAndFlush(beneficioToRemove)
    res.status(200).send({ message: 'beneficio deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeBeneficioInput, findAll, findOne, add, update, remove }

import { Request, Response, NextFunction } from 'express'
import { Beneficio } from './beneficios.entity.js'
import { Wallet } from '../wallet/wallet.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from '@mikro-orm/mongodb'
import { Rubro } from '../rubros/rubros.entity.js'

const em = orm.em

function sanitizeBeneficioInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    discount: req.body.discount,
    discountType: req.body.discountType,
    icon: req.body.icon,
    category: req.body.category,
    availableDays: req.body.availableDays,
    validity: req.body.validity,
    fecha_desde: req.body.fecha_desde,
    fecha_hasta: req.body.fecha_hasta,
    limit: req.body.limit,
    tope_reintegro: req.body.tope_reintegro,
    imageUrl: req.body.imageUrl,
    walletId: req.body.walletId || req.body.wallet,
    rubroId: req.body.rubroId || req.body.rubro
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function findAll(req: Request, res: Response) {
  try {
  const beneficios = await em.find(Beneficio, {} )
  res.status(200).
  json({ message: 'found all beneficios', data: beneficios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let beneficioFound;
    try {
      beneficioFound = await em.findOneOrFail(Beneficio, { id }, { populate: ['wallet', 'rubro'] });
    } catch (e) {
      // try by ObjectId in _id
      try {
        beneficioFound = await em.findOneOrFail(Beneficio, { _id: new ObjectId(id) }, { populate: ['wallet', 'rubro'] });
      } catch (err) {
        throw err;
      }
    }
    res.status(200).json({ message: 'found beneficio', data: beneficioFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Validar que walletId existe si se proporciona
    if (req.body.sanitizedInput.walletId) {
      let walletExists;
      try {
        // Intentar buscar por id string primero
        walletExists = await em.findOne(Wallet, { id: req.body.sanitizedInput.walletId });
        if (!walletExists) {
          // Si no se encuentra, intentar por ObjectId
          walletExists = await em.findOne(Wallet, { _id: new ObjectId(req.body.sanitizedInput.walletId) });
        }
      } catch (e) {
        // Si hay error en el formato de ObjectId, retornar error
        res.status(400).json({ message: 'Invalid walletId format' });
        return;
      }
      
      if (!walletExists) {
        res.status(404).json({ message: 'Wallet not found with provided walletId' });
        return;
      }
    } else {
      res.status(400).json({ message: 'walletId is required' });
      return;
    }

    // Validar que rubroId está presente
    if (!req.body.sanitizedInput.rubroId) {
      res.status(400).json({ message: 'rubroId is required' });
      return;
    }
    
    // Crear el payload con referencias
    const payload = { ...req.body.sanitizedInput };
    payload.wallet = em.getReference(Wallet, req.body.sanitizedInput.walletId);
    payload.rubro = em.getReference(Rubro, req.body.sanitizedInput.rubroId);
    delete payload.walletId;
    delete payload.rubroId;
    
    const beneficio = em.create(Beneficio, payload);
    await em.flush();
    res.status(201).json({ message: 'beneficio created', data: beneficio });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const beneficio = em.getReference(Beneficio, id);
    
    // Crear el payload para la actualización
    const payload = { ...req.body.sanitizedInput };
    
    // Validar que walletId existe si se proporciona en la actualización
    if (req.body.sanitizedInput.walletId) {
      let walletExists;
      try {
        // Intentar buscar por id string primero
        walletExists = await em.findOne(Wallet, { id: req.body.sanitizedInput.walletId });
        if (!walletExists) {
          // Si no se encuentra, intentar por ObjectId
          walletExists = await em.findOne(Wallet, { _id: new ObjectId(req.body.sanitizedInput.walletId) });
        }
      } catch (e) {
        res.status(400).json({ message: 'Invalid walletId format' });
        return;
      }
      
      if (!walletExists) {
        res.status(404).json({ message: 'Wallet not found with provided walletId' });
        return;
      }
      
      // Convertir walletId a referencia de wallet
      payload.wallet = em.getReference(Wallet, req.body.sanitizedInput.walletId);
      delete payload.walletId;
    }

    // Si rubroId está presente, crear la referencia sin validar existencia
    if (req.body.sanitizedInput.rubroId) {
      payload.rubro = em.getReference(Rubro, req.body.sanitizedInput.rubroId);
      delete payload.rubroId;
    }
    
    em.assign(beneficio, payload);
    await em.flush();
    res.status(200).json({ message: 'beneficio updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const beneficio = em.getReference(Beneficio, id)
    await em.removeAndFlush(beneficio)
    res.status(200).send({ message: 'beneficio deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeBeneficioInput, findAll, findOne, add, update, remove }

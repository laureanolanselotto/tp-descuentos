import { Request, Response, NextFunction } from 'express';
import { EntityName } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Beneficio } from './beneficios.entity.js';
import { Wallet } from '../wallet/wallet.entity.js';
import { Rubro } from '../rubros/rubros.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type SanitizedInput = Record<string, unknown>;

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
    walletId: req.body.walletId,
    rubroId: req.body.rubroId,
  } as SanitizedInput;

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function attachRelation(
  payload: Record<string, unknown>,
  sanitized: SanitizedInput,
  relationKey: 'wallet' | 'rubro',
  entity: EntityName<any>,
  messages: { missing: string; invalid: string; notFound: string },
  required: boolean,
) {
  const relationIdKey = `${relationKey}Id`;
  if (!(relationIdKey in sanitized)) {
    if (required) {
      throw new HttpError(400, messages.missing);
    }
    return;
  }

  const relationIdValue = sanitized[relationIdKey];
  if (typeof relationIdValue !== 'string' || relationIdValue.trim() === '') {
    throw new HttpError(400, messages.invalid);
  }

  const relationId = relationIdValue.trim();
  let entityFound: unknown = null;
  try {
    entityFound =
      (await em.findOne(entity, { id: relationId })) ??
      (await em.findOne(entity, { _id: new ObjectId(relationId) }));
  } catch (err) {
    throw new HttpError(400, messages.invalid);
  }

  if (!entityFound) {
    throw new HttpError(404, messages.notFound);
  }

  const target = payload as Record<string, unknown>;
  target[relationKey] = em.getReference(entity, relationId);
  delete target[relationIdKey];
}

async function findAll(_req: Request, res: Response) {
  try {
    const beneficios = await em.find(Beneficio, {}, { populate: ['wallet', 'rubro'] });
    res.status(200).json({ message: 'found all beneficios', data: beneficios });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let beneficioFound;
    try {
      beneficioFound = await em.findOneOrFail(Beneficio, { id }, { populate: ['wallet', 'rubro'] });
    } catch (e) {
      beneficioFound = await em.findOneOrFail(
        Beneficio,
        { _id: new ObjectId(id) },
        { populate: ['wallet', 'rubro'] },
      );
    }
    res.status(200).json({ message: 'found beneficio', data: beneficioFound });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const sanitized = req.body.sanitizedInput as SanitizedInput;
    const payload: Record<string, unknown> = { ...sanitized };

    await attachRelation(payload, sanitized, 'wallet', Wallet, {
      missing: 'walletId is required',
      invalid: 'Invalid walletId format',
      notFound: 'Wallet not found with provided walletId',
    }, true);

    await attachRelation(payload, sanitized, 'rubro', Rubro, {
      missing: 'rubroId is required',
      invalid: 'Invalid rubroId format',
      notFound: 'Rubro not found with provided rubroId',
    }, true);

    const beneficio = em.create(Beneficio, payload as any);
    await em.flush();
    res.status(201).json({ message: 'beneficio created', data: beneficio });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const beneficio = em.getReference(Beneficio, id);
    const sanitized = req.body.sanitizedInput as SanitizedInput;
    const payload: Record<string, unknown> = { ...sanitized };

    await attachRelation(payload, sanitized, 'wallet', Wallet, {
      missing: 'walletId is required',
      invalid: 'Invalid walletId format',
      notFound: 'Wallet not found with provided walletId',
    }, false);

    await attachRelation(payload, sanitized, 'rubro', Rubro, {
      missing: 'rubroId is required',
      invalid: 'Invalid rubroId format',
      notFound: 'Rubro not found with provided rubroId',
    }, false);

    em.assign(beneficio, payload as any);
    await em.flush();
    res.status(200).json({ message: 'beneficio updated' });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const beneficio = em.getReference(Beneficio, id);
    await em.removeAndFlush(beneficio);
    res.status(200).send({ message: 'beneficio deleted' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
}

export { sanitizeBeneficioInput, findAll, findOne, add, update, remove };




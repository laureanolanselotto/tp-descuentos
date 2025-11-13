import { Request, Response, NextFunction } from 'express';
import { Wallet } from './wallet.entity.js';
import { orm } from '../shared/db/orm.js';
import { ObjectId } from '@mikro-orm/mongodb';
import { Beneficio } from '../beneficios/beneficios.entity.js';

const em = orm.em;

function sanitizeWalletInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    descripcion: req.body.descripcion,
    interes_anual: req.body.interes_anual,
    beneficios: req.body.beneficios,
    personas: req.body.personas,
    notificaciones: req.body.notificaciones,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function findAll(_req: Request, res: Response) {
  try {
  const wallets = await em.find(Wallet, {}, { populate: ['beneficios', 'personas', 'notificaciones'] });
    res.status(200).json({ message: 'found all wallets', data: wallets });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let walletFound;
    try {
  walletFound = await em.findOneOrFail(Wallet, { id }, { populate: ['beneficios', 'personas', 'notificaciones'] });
    } catch (e) {
      try {
  walletFound = await em.findOneOrFail(Wallet, { _id: new ObjectId(id) }, { populate: ['beneficios', 'personas', 'notificaciones'] });
      } catch (err) {
        throw err;
      }
    }
    res.status(200).json({ message: 'found wallet', data: walletFound });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
   try {
    const wallets = em.create(Wallet, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'wallet created', data: wallets })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let walletToUpdate;
    try {
      walletToUpdate = await em.findOneOrFail(Wallet, { id });
    } catch (e) {
      walletToUpdate = await em.findOneOrFail(Wallet, { _id: new ObjectId(id) });
    }
    em.assign(walletToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'wallet updated', data: walletToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    
    // Buscar la wallet por id o _id
    let wallet;
    try {
      wallet = await em.findOneOrFail(Wallet, { id }, { populate: ['beneficios'] });
    } catch (e) {
      wallet = await em.findOneOrFail(Wallet, { _id: new ObjectId(id) }, { populate: ['beneficios'] });
    }

    // Eliminar todos los beneficios asociados primero
    const beneficios = await em.find(Beneficio, { wallet: wallet });
    
    if (beneficios.length > 0) {
      console.log(`Eliminando ${beneficios.length} beneficios asociados a la wallet ${wallet.name}`);
      await em.removeAndFlush(beneficios);
    }

    // Ahora eliminar la wallet
    await em.removeAndFlush(wallet);
    
    res.status(200).json({ 
      message: 'Wallet eliminada correctamente', 
      data: { 
        deletedWallet: wallet.name,
        deletedBeneficios: beneficios.length 
      } 
    });
  } catch (error: any) {
    console.error('Error al eliminar wallet:', error);
    res.status(500).json({ message: error.message });
  }
}


export { sanitizeWalletInput, findAll, findOne, add, update, remove };

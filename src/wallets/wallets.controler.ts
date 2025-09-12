import { Request, Response, NextFunction } from 'express';
import { wallet } from './wallets.entity.js';
import { WalletsRepository } from './wallets.repository.js';

const repository = new WalletsRepository();

function sanitizeWalletInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        icono: req.body.icono,
        interes: req.body.interes,
        id: req.body.id,
    };
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

async function findAll(req: Request, res: Response) {
    res.json({ data: await repository.findAll() });
}

async function findOne(req: Request, res: Response) {
    const id = req.params.id;
    const data = await repository.findOne({ id });
    if (!data) {
        res.status(404).send({ message: 'Wallet no encontrada' });
        return;
    }
    res.json({ data });
}

async function add(req: Request, res: Response) {
    const input = req.body.sanitizedInput;
    const w = new wallet(
        input.nombre,
        input.icono,
        input.interes,
        input.id,
    );
    const created = await repository.add(w);
    res.status(201).send({ message: 'Wallet creada con éxito', data: created });
}

async function uppdate(req: Request, res: Response) {
    req.body.sanitizedInput.id = req.params.id;
    const updated = await repository.update(req.body.sanitizedInput);
    if (!updated) {
        res.status(404).send({ message: 'Wallet no encontrada' });
    } else {
        res.status(200).send({ message: 'Wallet modificada con éxito', data: updated });
    }
}

async function remove(req: Request, res: Response) {
    const id = req.params.id;
    const deleted = await repository.delete({ id });
    if (!deleted) {
        res.status(404).send({ message: 'Wallet no encontrada' });
        return;
    }
    res.status(200).send({ message: 'Wallet eliminada con éxito' });
}

export const controler = { sanitizeWalletInput, findAll, findOne, add, uppdate, remove };


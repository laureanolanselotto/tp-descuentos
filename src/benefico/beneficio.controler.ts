import { Request, Response, NextFunction } from "express";
import { beneficio } from "./beneficio.entity.js";
import { BeneficioRepository } from "./beneficio.repository.js";

const repository = new BeneficioRepository();

function sanitizeBeneficioInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        name: req.body.name,
        porcentaje: req.body.porcentaje,
        descripcion: req.body.descripcion,
        fechaInicio: req.body.fechaInicio,
        fechaFin: req.body.fechaFin,
        mentodoPago: [],
        tipoDescuento: req.body.tipoDescuento, 
        id: req.body.id,
    };
    // Elimina los campos undefined
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

function findAll(req: Request, res: Response) {
    res.json({ data: repository.findAll() });
}

function findOne(req: Request, res: Response) {
    const id = req.params.id;
    const beneficio = repository.findOne({ id });
    if (!beneficio) {
        res.status(404).send({ message: 'Beneficio no encontrado' });
        return;
    }
    res.json({ data: beneficio });
}

function add(req: Request, res: Response) {
    const input = req.body.sanitizedInput;

    const Beneficio = new beneficio(
        input.nombre,
        input.descripcion,
        input.descuento,
        input.fechaInicio,
        input.fechaFin,
        input.mentodoPago,
        input.tipoDescuento,
        input.id,
    );
    const nuevoBeneficio = repository.add(beneficio);
    res.status(201).send({ message: 'Beneficio creado con éxito', data: nuevoBeneficio });
}

function uppdate(req: Request, res: Response) {
    req.body.sanitizedInput.id = req.params.id; // Aseguramos que el ID del objeto actualizado sea el mismo que el de la URL
    const beneficioUpdate = repository.update(req.body.sanitizedInput);

    if (!beneficioUpdate) {
        res.status(404).send({ message: 'Beneficio no encontrado' });
    } else {
        res.status(200).send({ message: 'Beneficio modificado con éxito', data: beneficioUpdate });
    }
}

function remove(req: Request, res: Response) {
    const id = req.params.id;
    const eliminar = repository.delete({ id });
    if (eliminar === undefined) {
        res.status(404).send({ message: 'Beneficio no encontrado' });
        return;
    }
    res.status(200).send({ message: 'Beneficio eliminado con éxito' });
}

export const controler = { sanitizeBeneficioInput, findAll, findOne, add, uppdate, remove };

//export {sanitizeBeneficioInput ,findAll, findOne, repository as BeneficioRepository}
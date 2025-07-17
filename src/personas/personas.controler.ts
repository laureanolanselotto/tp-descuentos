import { Request, Response, NextFunction } from 'express'
import { PersonasRepository } from "./personas.repository.js"
import { persona } from "./personas.entity.js";

const repository = new PersonasRepository()

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        name: req.body.name,
        apellido: req.body.apellido,
        email: req.body.email,
        tel: req.body.tel,
        dni: req.body.dni,
    };
    // Elimina los campos undefined
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

async function findAll( req:Request, res:Response)  {
    res.json({data: await repository.findAll() });
}

async function findOne(req: Request, res: Response) {
    const id = req.params.id;
    const persona = await repository.findOne({ id });
    if (!persona) {
        res.status(404).send({ message: 'Persona no encontrada' });
        return;
    }
    res.json({data: persona});  
}

async function add (req: Request, res: Response) {
    const input = req.body.sanitizedInput;

    const Personas = new persona( 
        input.name, 
        input.apellido,
        input.email,
        input.tel, 
        input.dni,
        input.id,
    )
    const Persona = await repository.add(Personas);
    res.status(201).send({message : 'Persona creada con éxito', data: Persona});

}
async function uppdate (req: Request, res: Response)  {
    req.body.sanitizedInput.id = req.params.id; // Aseguramos que el ID del objeto actualizado sea el mismo que el de la URL
    const personasUpdate = await repository.update(req.body.sanitizedInput )

    if (!personasUpdate) {
        res.status(404).send({ message: 'Persona no encontrada' });
    } else {
        res.status(200).send({ message: 'Persona modificada con éxito', data: personasUpdate });
    }
}

async function remove (req: Request, res: Response)  {
    const id = req.params.id 
    const eliminar = await repository.delete({ id });
    if (eliminar === undefined) {
        res.status(404).send({ message: 'Persona no encontrada' });
    }
    res.status(200).send({ message: 'Persona eliminada con éxito' });
}


export const controler = {sanitizePersonaInput ,findAll,findOne,add, uppdate, remove};

//export {sanitizePersonaInput ,findAll, findOne, repository as PersonasRepository}
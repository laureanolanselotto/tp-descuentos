import { Request, Response, NextFunction } from 'express'
import { PersonasRepository } from "./personas.repository.memory.js"
import { persona } from "./personas.entity.js";
import { Validators } from "../shared/validators/validators.js";
import { asyncHandler } from "../shared/middleware/errorHandler.js";

const repository = new PersonasRepository()

const sanitizePersonaInput = (req: Request, res: Response, next: NextFunction): void => {
    // Sanitizar y validar datos
    const sanitizedData = {
        name: Validators.sanitizeString(req.body.name),
        apellido: Validators.sanitizeString(req.body.apellido),
        email: req.body.email?.toLowerCase().trim(),
        tel: parseInt(req.body.tel),
        dni: parseInt(req.body.dni),
    };

    // Validar datos
    const validation = Validators.validatePersona(sanitizedData);
    
    if (!validation.isValid) {
        res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: validation.errors
        });
        return;
    }

    req.body.sanitizedInput = sanitizedData;
    next();
};

const findAll = asyncHandler(async (req: Request, res: Response) => {
    const personas = await repository.findAll();
    res.json({
        success: true,
        data: personas || []
    });
});

const findOne = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const persona = await repository.findOne({ id });
    
    if (!persona) {
        return res.status(404).json({
            success: false,
            message: 'Persona no encontrada'
        });
    }
    
    res.json({
        success: true,
        data: persona
    });
});

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
async function update (req: Request, res: Response)  {
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


export const controler = {sanitizePersonaInput ,findAll,findOne,add, update, remove};

//export {sanitizePersonaInput ,findAll, findOne, repository as PersonasRepository}
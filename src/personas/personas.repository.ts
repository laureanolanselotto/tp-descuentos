
import { persona } from "./personas.entity.js";
import { Repository } from "../shared/repository.js";
const personas =  [
    new persona(
        'lauerano',
        'lanselotto',
        'laureano@gmail.com' ,
        123456789,
        44931516,
        '12345678-1234-1234-1234-123456789012'
    ),
]


export class PersonasRepository implements Repository <persona> {
    public findAll(): persona[] | undefined {
        return personas;
    }
    public findOne(nombre: {id: string}): persona| undefined {
        personas.find((persona) => persona.id === nombre.id)
        return personas.find((persona)=> persona.id === nombre.id);
    }
    public add(nombre: persona): persona | undefined {
        personas.push(nombre);
        return nombre;
    }
    public update(nombre : persona): persona | undefined {
        const index = personas.findIndex((persona) => persona.id === nombre.id);
        if (index !== -1) {
            personas[index] = {...personas[index], ...nombre};  
        }
        return personas[index]
    }
    public delete(nombre: {id: string}): persona | undefined {
        const personaIdx = personas.findIndex((persona) => persona.id === nombre.id)
    if (personaIdx !== -1) {
    const deletePersonas  = personas[personaIdx];
    personas.splice(personaIdx, 1); // Elimina la persona del array , el uno es para indicar que se elimina un elemento
    return deletePersonas;
    }}
}
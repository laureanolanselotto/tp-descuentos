
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
    public async findAll(): Promise<persona[] | undefined >{
        return await personas;
    }
    public async findOne(nombre: {id: string}): Promise<persona | undefined> {
        return await (personas.find((persona)=> persona.id === nombre.id));
    }
    public async add(nombre: persona): Promise<persona | undefined> {
        personas.push(nombre);
        return await nombre;
    }
    public async update(nombre : persona): Promise<persona | undefined> {
        const index = await personas.findIndex((persona) => persona.id === nombre.id);
        if (index !== -1) {
            personas[index] = {...personas[index], ...nombre};  
        }
        return await personas[index];
    }
    public async delete(nombre: {id: string}): Promise<persona | undefined> {
        const personaIdx = await personas.findIndex((persona) => persona.id === nombre.id)
    if (personaIdx !== -1) {
    const deletePersonas  = personas[personaIdx];
    personas.splice(personaIdx, 1); // Elimina la persona del array , el uno es para indicar que se elimina un elemento
    return await deletePersonas;
    }}
}
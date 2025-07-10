// aceso a la base de datos                               // T vendria a funcionas como una variable generica
export interface Repository<T> {
    findAll(): T[] | undefined
    findOne(nombre: {id: string}): T | undefined         //{id: string} sirve para decir que el elemento que se busca tiene una propiedad id de tipo string
    add(nombre: T): T | undefined
    update(nombre: T): T | undefined
    delete(nombre: {id: string}): T | undefined
}
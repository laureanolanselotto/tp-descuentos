// aceso a la base de datos                               // T vendria a funcionas como una variable generica
export interface Repository<T> {
    findAll(): Promise<T[] | undefined>
    findOne(params: {id: string}): Promise<T | undefined>         // params tiene una propiedad id de tipo string
    add(entity: T): Promise<T | undefined>    //el codigo es asincronico, por eso se usa Promise
    update(entity: T): Promise<T | undefined>
    delete(params: {id: string}): Promise<T | undefined>
}
import crypto from 'node:crypto';
import { ObjectId } from 'mongodb';
export class beneficio {
    constructor(
        public name: string,
        public porcentaje: number,
        public descripcion: string,
        public fechaInicio: string,
        public fechaFin: string,
        public mentodoPago: string[],
        public tipoDescuento: string,
        public id = crypto.randomUUID(),
        public _id?: ObjectId,
    ) {}
}

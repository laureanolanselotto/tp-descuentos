import crypto from 'node:crypto';
export class beneficio {
    constructor(
        public name: string,
        public porcentaje: number,
        public descripcion: string,
        public fechaInicio: Date,
        public fechaFin: Date,
        public mentodoPago: [],
        public tipoDescuento: string,
        public id = crypto.randomUUID()
    ) {}
}
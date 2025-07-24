import crypto from 'node:crypto';
export class beneficio {
    constructor(
        public name: string,
        public porcentaje: number,
        public descripcion: string,
        public fechaInicio: string,
        public fechaFin: string,
        public metodoPago: string [],
        public tipoDescuento: string,
        public id = crypto.randomUUID()
    ) {}
}
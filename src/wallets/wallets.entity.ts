import crypto from 'node:crypto';
import { ObjectId } from 'mongodb';

export class wallet {
    constructor(
        public nombre: string,
        public icono: string,
        public interes: number,
        public id = crypto.randomUUID(),
        public _id?: ObjectId,
    ) {}
}


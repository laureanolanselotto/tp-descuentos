import { ObjectId } from 'mongodb';
import crypto from 'node:crypto';
export class persona {
    constructor(
        public name: string,
        public apellido: string,
        public email: string,
        public tel: number,
        public dni: number,
        public id = crypto.randomUUID(),
        public _id? :ObjectId 
    ) {}
}
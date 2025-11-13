import { Entity, Property, PrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity()
export class HistorialAdmin {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  personaId!: string; // ID del admin que realizó la modificación

  @Property()
  personaNombre!: string; // Nombre del admin para referencia rápida

  @Property()
  fechaModificacion!: Date; // Fecha y hora de la modificación

  @Property()
  entidad!: string; // Nombre de la entidad modificada (beneficios, wallets, rubros, etc.)

  @Property()
  entidadId!: string; // ID del registro modificado

  @Property()
  accion!: string; // Tipo de acción: 'CREATE', 'UPDATE', 'DELETE'

  @Property({ type: "json", nullable: true })
  cambios?: {
    antes?: Record<string, any>; // Estado anterior (para UPDATE y DELETE)
    despues?: Record<string, any>; // Estado nuevo (para CREATE y UPDATE)
  };

  @Property({ nullable: true })
  descripcion?: string; // Descripción opcional del cambio

  constructor() {
    this.fechaModificacion = new Date();
  }
}

import { Entity, Property, PrimaryKey, BaseEntity } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity()
export class HistorialAdmin extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  personaNombre!: string; // Nombre del admin

  @Property()
  fechaModificacion!: Date; // Fecha y hora de la modificación

  @Property()
  entidad!: string; // Entidad modificada (beneficios, wallets, rubros, etc.)

  @Property()
  accion!: string; // Tipo de acción: 'CREATE', 'UPDATE', 'DELETE'

  constructor() {
    super();
    this.fechaModificacion = new Date();
  }
}

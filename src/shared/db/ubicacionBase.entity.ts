import { Property } from "@mikro-orm/core";
import { BaseEntity } from "./baseEntity.entity.js";

export abstract class UbicacionBase extends BaseEntity {
  @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitud?: number;

  @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitud?: number;

  @Property({ nullable: true })
  direccion?: string;

  @Property({ nullable: true })
  alias?: string;

  @Property({ onCreate: () => new Date() })
  fecha_creacion: Date = new Date();
}

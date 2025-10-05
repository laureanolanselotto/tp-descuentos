import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Notificacion extends BaseEntity {
  @Property({ nullable: false })
  promocion!: string;

  @Property({ nullable: false })
  porcentaje_promocion!: number;

  @Property({ type: 'json', nullable: false })
  dias_disponibles!: number[];

  @Property({ nullable: false })
  tipo_promocion!: string;

  @Property({ nullable: false })
  max_interes!: number;
}

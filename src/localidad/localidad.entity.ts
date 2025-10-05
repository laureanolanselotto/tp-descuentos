import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class localidad extends BaseEntity {
  @Property({ nullable: false })
  coordenadas!: string;

  @Property({ nullable: false })
  calles!: string;

  @Property({ nullable: false })
  numero_calle!: number;
}

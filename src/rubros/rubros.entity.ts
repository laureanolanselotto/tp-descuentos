import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Rubro extends BaseEntity {
  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  apellido!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: false })
  tel!: number;

  @Property({ nullable: false })
  dni!: number;

  @Property({ nullable: true })
  personaClass?: string;

  @Property({ type: "json", nullable: true })
  items?: string[];
}

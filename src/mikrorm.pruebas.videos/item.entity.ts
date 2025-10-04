import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { persona } from "../personas/personas.entity.js";

@Entity()
export class Item extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToMany(() => persona, (p) => p.items)
  personas = new Collection<persona>(this);
}

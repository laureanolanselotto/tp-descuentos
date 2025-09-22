import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { persona } from "./personas.entity.js";

/*esta es una relacion muchos a muchos*/
@Entity()
export class Item extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property()
  description?: string;

  @ManyToMany(() => persona, (p) => p.items)
  personas = new Collection<persona>(this);
}

import { Cascade, Collection, Entity, ManyToMany, ManyToOne, Property,Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Item } from "./item.entity.js";
import { personaClass } from "./personasClass.entity.js";

@Entity()
export class persona extends BaseEntity {
  @ManyToOne(() => personaClass, { nullable: false })
  personaClass!:Rel <personaClass>;

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

  @ManyToMany(() => Item, (item) => item.personas, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  items = new Collection<Item>(this);
}

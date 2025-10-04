import { Cascade, Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { persona } from "../personas/personas.entity.js";
// relacion de uno a muchos
@Entity()
export class personaClass extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property({ nullable: false, unique: true })
  apellido!: string;

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => persona, (personas) => personas.personaClass, {
    cascade: [Cascade.ALL],
  })
  characters = new Collection<persona>(this);
}

import {  Cascade, Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Rel} from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Beneficio } from "../beneficios/beneficios.entity.js";
import { persona } from "../personas/personas.entity.js";

@Entity()
export class Wallet extends BaseEntity {
  @Property({nullable: false})
  name!: string;

  @Property({nullable: false})
  discount!: string;

  @Property({nullable: false})
  fechaDesde!: string;

  @Property({nullable: false})
  fechaHasta!: string;

  @Property({nullable: false})
  category!: string;

  @Property({nullable: false})
  availableDays!: number[];

  @Property({ nullable: true })
  interes_anual?: number;

  // Link to the owning persona (many wallets can belong to one persona)
  @ManyToOne(() => persona, { nullable: true })
  persona?: Rel<persona>;

    @OneToMany(() => Beneficio, beneficio => beneficio.wallet)
  beneficios = new Collection<Beneficio>(this);


}
 /* @OneToMany(() => persona, (personas) => personas.personaClass, {
    cascade: [Cascade.ALL],
  })
  characters = new Collection<persona>(this);*/

  /* @ManyToMany(() => persona, (p) => p.items)
  personas = new Collection<Persona>(this);//esta es una relacion muchos a muchos*/

/*  @OneToMany(() => Beneficio, beneficio => beneficio.wallet)
  beneficios = new Collection<Beneficio>(this); //esta es una relacion uno a muchos*/
  /* @ManyToMany(() => Item, (item) => item.personas, {
      cascade: [Cascade.ALL],
      owner: true,
    })
    items = new Collection<Item>(this);*/ 
import { Cascade, Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Item } from "../mikrorm.pruebas.videos/item.entity.js";
import { personaClass } from "../mikrorm.pruebas.videos/personasClass.entity.js";
import { Wallet } from "../wallet/wallet.entity.js";

@Entity()
export class persona extends BaseEntity {
  @ManyToOne(() => personaClass, { nullable: false })
  personaClass!: Rel<personaClass>;

  @ManyToOne(() => Wallet, { nullable: false })
  wallet!: Rel<Wallet>;

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
  direccion?: string;

  @ManyToMany(() => Item, (item) => item.personas, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  items = new Collection<Item>(this);

}

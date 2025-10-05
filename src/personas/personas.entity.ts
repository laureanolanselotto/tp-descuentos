import { Cascade, Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Wallet } from "../wallet/wallet.entity.js";
@Entity()
export class persona extends BaseEntity {
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

  @ManyToMany(() => Wallet, (wallet) => wallet.personas, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  wallets = new Collection<Wallet>(this);

}


// --- relaciones viejas del video de meca ---
/*  @ManyToMany(() => Item, (item) => item.personas, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  items = new Collection<Item>(this);
*/ 
/* @ManyToOne(() => personaClass, { nullable: false })
  personaClass!: Rel<personaClass>; */
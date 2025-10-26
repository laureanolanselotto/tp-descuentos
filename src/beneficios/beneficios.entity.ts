import { Entity, Property, ManyToOne, Rel, t,OneToMany, Cascade,Collection, ManyToMany } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Wallet } from "../wallet/wallet.entity.js";
import { Rubro } from "../rubros/rubros.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";

@Entity()
export class Beneficio extends BaseEntity {
  // Basic identifying/title fields
  @Property({ nullable: false })
  descripcion!: string;

  // Discount information
  @Property({ nullable: true })
  discount?: number;

  @Property({ nullable: true })
  cant_cuotas?: number;

  @Property({ nullable: false })
  discountType!: string; // e.g. 'cuota' | 'reintegro' | 'off'


  // Days available stored as JSON array of numbers (0-6 or custom mapping)
  @Property({ type: 'json', nullable: false })
  availableDays!: number[];

 

  @Property({ nullable: false })
  fecha_desde!: string;

  @Property({ nullable: false })
  fecha_hasta!: string;

  @Property({ nullable: false })
  limit!: string;

  @Property({ nullable: true })
  tope_reintegro?: number;

  @Property({ nullable: true })
  imageUrl?: string;

  // Relation to Wallet (many beneficios belong to one wallet)
  @ManyToOne(() => Wallet, { nullable: false })
  wallet!: Rel<Wallet>;

  @ManyToOne(() => Rubro, { nullable: false })
  rubro!: Rel<Rubro>;

  // Un beneficio puede aplicar en muchas provincias (localidades)
  @ManyToMany(() => Localidad, (localidad) => localidad.beneficios, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  localidades = new Collection<Localidad>(this);
}

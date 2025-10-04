import { Entity, Property, ManyToOne, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Wallet } from "../wallet/wallet.entity.js";

@Entity()
export class Beneficio extends BaseEntity {
  // Basic identifying/title fields
  @Property({ nullable: false })
  name!: string;

  // Discount information
  @Property({ nullable: false })
  discount!: number;

  @Property({ nullable: false })
  discountType!: string; // e.g. 'cuota' | 'reintegro' | 'off'

  // Icon representation: store a string identifier (e.g. icon name or class) instead of ReactNode
  @Property({ nullable: true })
  icon?: string;

  @Property({ nullable: false })
  category!: string;

  // wallet relation (see wallet entity)

  // Days available stored as JSON array of numbers (0-6 or custom mapping)
  @Property({ type: 'json', nullable: true })
  availableDays?: number[];

  // Optional validity / date range / limit fields
  @Property({ nullable: true })
  validity?: string;

  @Property({ nullable: true })
  fecha_desde?: string;

  @Property({ nullable: true })
  fecha_hasta?: string;

  @Property({ nullable: true })
  limit?: string;

  @Property({ nullable: true })
  tope_reintegro?: number;

  @Property({ nullable: true })
  imageUrl?: string;

  // Relation to Wallet (many beneficios belong to one wallet)
  @ManyToOne(() => Wallet, { nullable: false })
  wallet!: Rel<Wallet>;
}

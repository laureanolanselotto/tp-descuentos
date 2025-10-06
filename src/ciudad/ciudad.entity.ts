import { Cascade, Collection, Entity, ManyToOne, OneToMany, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";
import { persona } from "../personas/personas.entity.js";

@Entity()
export class Ciudad extends BaseEntity {
  @Property({ nullable: false })
  nombreCiudad!: string;

  @Property({ nullable: true })
  codigoPostal?: string;

  @Property({ nullable: true })
  latitud?: number;

  @Property({ nullable: true })
  longitud?: number;

  // relacion muchas ciudades pertenecen a una localidad
  @ManyToOne(() => Localidad, { nullable: false })
  localidad!: Rel<Localidad>;

  // relacion una ciudad puede tener muchas personas
  @OneToMany(() => persona, (persona) => persona.ciudad, {
    cascade: [Cascade.ALL],
  })
  personas = new Collection<persona>(this);
}
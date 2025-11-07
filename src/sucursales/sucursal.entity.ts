import { Entity, ManyToOne, OneToMany, Property, Rel, Collection } from "@mikro-orm/core";
import { UbicacionBase } from "../shared/db/ubicacionBase.entity.js";
import { Ciudad } from "../ciudad/ciudad.entity.js";
// import { Beneficio } from "../beneficios/beneficios.entity.js"; // Descomentar cuando Beneficio esté listo

@Entity()
export class Sucursal extends UbicacionBase {
  @Property({ length: 100, nullable: false })
  nombre!: string;

  @Property({ length: 50, nullable: true })
  telefono?: string;

  @Property({ length: 100, nullable: true })
  email_contacto?: string;

  // Relación ManyToOne con Ciudad
  @ManyToOne(() => Ciudad, { nullable: false })
  ciudad!: Rel<Ciudad>;

  // Relación OneToMany con Beneficio (comentada hasta que exista la entidad)
  // @OneToMany(() => Beneficio, (beneficio) => beneficio.sucursal)
  // beneficios = new Collection<Beneficio>(this);
}

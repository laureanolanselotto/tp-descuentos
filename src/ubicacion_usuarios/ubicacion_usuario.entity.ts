import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { UbicacionBase } from "../shared/db/ubicacionBase.entity.js";
import { persona } from "../personas/personas.entity.js";
import { Ciudad } from "../ciudad/ciudad.entity.js";

@Entity()
export class UbicacionUsuario extends UbicacionBase {
  @Property({ default: false })
  activa: boolean = false;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precision_metros?: number;

  // Relación ManyToOne con Persona
  @ManyToOne(() => persona, { nullable: false })
  persona!: Rel<persona>;

  // Relación ManyToOne con Ciudad
  @ManyToOne(() => Ciudad, { nullable: false })
  ciudad!: Rel<Ciudad>;
}

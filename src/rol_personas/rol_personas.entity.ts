import { Cascade, Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
@Entity()
export class roles extends BaseEntity {
    @Property({ nullable: false })
    email_admins!: string;
}

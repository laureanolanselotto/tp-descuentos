import { Cascade, Entity, OneToMany, PrimaryKey, Property, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { persona } from "./personas.entity.js";
@Entity()
export class personaClass extends BaseEntity{
        @Property({ nullable: false, unique: true })
        name!: string
        @Property(  {nullable:false, unique:true} ) // nullable false porque es obligatorio, unique false porque no se pueden repetir
        apellido!: string
        
        @Property()
        description?: string
//a partir de aca se trabaja relacione entre tablas con @ManyToOne , @OneToMany , @ManyToMany [en este caso es una relacion uno a muchos]
        @OneToMany(() => persona, (personas) => personas.personaClass, { // Cascade.ALL para que si se borra una personaClass se borren todos los person,Merge
     // Collection es una clase de mikro-orm que permite manejar las relaciones entre entidades
            cascade: [Cascade.ALL],
        })
        characters = new Collection<persona>(this)


    }

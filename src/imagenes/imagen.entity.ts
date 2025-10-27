import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';

@Entity()
export class Imagen extends BaseEntity {
  @Property({ nullable: false, length: 2048 })
  url!: string;

  @Property({ nullable: false })
  nombre!: string;
}

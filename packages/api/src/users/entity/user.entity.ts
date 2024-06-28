import { ObjectId } from 'mongodb'
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  ObjectIdColumn,
} from 'typeorm'

@Entity({ name: 'users' })
export class UserEntity {
  
  @ObjectIdColumn()
  id: ObjectId

  @Column({ nullable: false })
  email: string

  @Column({ nullable: false })
  firstName: string

  @Column()
  isExternal: boolean

  @Column()
  lastName?: string

  @Column()
  nickName?: string

  @Column()
  tenantId?: string

  @Column()
  externalId?: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}

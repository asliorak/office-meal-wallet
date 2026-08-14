import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'number', default: 2500 })
  balance!: number;

  @Column({ nullable: true, default: 'USER' })
  role?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({ name: 'transactions' })
export class Transaction {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  senderId?: string;

  @Column({ nullable: true })
  receiverId?: string;

  @Column()
  type!: string;

  @Column({ type: 'number' })
  amount!: number;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

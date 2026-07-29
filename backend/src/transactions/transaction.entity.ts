import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TransactionType {
  PAYMENT = 'payment',
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  senderId?: number;

  @Column({ nullable: true })
  receiverId?: number;

  @Column({ type: 'integer' })
  amountInKurus!: number;

  @Column({
    type: 'varchar',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({ nullable: true })
  category?: string;

  @Column()
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

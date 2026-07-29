import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn()
  key!: string;

  @Column('simple-json')
  response!: any;

  @CreateDateColumn()
  createdAt!: Date;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Kullanıcıya ait tüm işlemleri getirme
  async findAll(userId?: string) {
    const transactions = await this.transactionRepository.find();
    if (!userId) return transactions;

    return transactions.filter(
      (tx) =>
        String(tx.userId) === String(userId) ||
        String(tx.senderId) === String(userId) ||
        String(tx.receiverId) === String(userId),
    );
  }

  // Yeni işlem kaydı oluşturma
  async create(data: Partial<Transaction>) {
    const newTx = this.transactionRepository.create(data);
    return await this.transactionRepository.save(newTx);
  }
}

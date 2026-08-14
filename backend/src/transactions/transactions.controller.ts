import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

interface CreateTransactionDto {
  userId: string;
  type: string;
  amount: number;
  description?: string;
  receiverId?: string;
}

@Controller('transactions')
export class TransactionsController {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  @Get()
  async getTransactions(
    @Query('userId') userId?: string,
    @Query('role') role?: string,
  ) {
    const transactions = await this.transactionRepository.find();

    // Rol ADMIN ise tüm geçmişi dön
    if (role === 'ADMIN') {
      return transactions.map((tx) => ({
        id: tx._id ? tx._id.toString() : '',
        _id: tx._id ? tx._id.toString() : '',
        userId: tx.userId,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        createdAt: tx.createdAt,
      }));
    }

    // Normal kullanıcı ise sadece kendi işlemlerini getir
    const userTx = transactions.filter(
      (tx) => String(tx.userId) === String(userId),
    );

    return userTx.map((tx) => ({
      id: tx._id ? tx._id.toString() : '',
      _id: tx._id ? tx._id.toString() : '',
      userId: tx.userId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      createdAt: tx.createdAt,
    }));
  }

  @Post()
  async createTransaction(@Body() body: CreateTransactionDto) {
    const newTx = this.transactionRepository.create(body);
    return await this.transactionRepository.save(newTx);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import { User } from '../auth/user.entity';

export interface TransactionResult {
  message: string;
  newBalance: number;
  transaction: Transaction;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // 1. Ödeme Yap (Hızlı Ödeme)
  async makePayment(
    userId: number,
    category: string,
    amountTL: number,
  ): Promise<TransactionResult> {
    const amountInKurus = Math.round(amountTL * 100);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı');

    const currentBalanceKurus = Math.round(user.balance * 100);
    if (currentBalanceKurus < amountInKurus) {
      throw new BadRequestException('Bakiye yetersiz! Bakiye eksiye düşemez.');
    }

    user.balance = (currentBalanceKurus - amountInKurus) / 100;
    await this.userRepo.save(user);

    const txData = this.txRepo.create({
      senderId: userId,
      amountInKurus,
      type: TransactionType.PAYMENT,
      category: category,
      description: `${category.toUpperCase()} ödemesi yapıldı`,
    });

    const savedTx: Transaction = await this.txRepo.save(txData);

    return {
      message: 'Ödeme başarılı',
      newBalance: user.balance,
      transaction: savedTx,
    };
  }

  // 2. Arkadaşa Transfer
  async transferToFriend(
    senderId: number,
    receiverId: number,
    amountTL: number,
  ): Promise<TransactionResult> {
    if (senderId === receiverId) {
      throw new BadRequestException('Kendinize transfer yapamazsınız');
    }

    const amountInKurus = Math.round(amountTL * 100);
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new BadRequestException('Gönderici veya alıcı bulunamadı');
    }

    const senderBalanceKurus = Math.round(sender.balance * 100);
    if (senderBalanceKurus < amountInKurus) {
      throw new BadRequestException('Bakiye yetersiz!');
    }

    sender.balance = (senderBalanceKurus - amountInKurus) / 100;
    receiver.balance =
      (Math.round(receiver.balance * 100) + amountInKurus) / 100;

    await this.userRepo.save(sender);
    await this.userRepo.save(receiver);

    const txData = this.txRepo.create({
      senderId,
      receiverId,
      amountInKurus,
      type: TransactionType.TRANSFER,
      category: 'transfer',
      description: `${receiver.email} kullanıcısına transfer`,
    });

    const savedTx: Transaction = await this.txRepo.save(txData);

    return {
      message: 'Transfer başarılı',
      newBalance: sender.balance,
      transaction: savedTx,
    };
  }

  // 3. Admin Bakiye Yükleme
  async depositBalance(
    targetUserId: number,
    amountTL: number,
  ): Promise<TransactionResult> {
    const amountInKurus = Math.round(amountTL * 100);
    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı');

    user.balance = (Math.round(user.balance * 100) + amountInKurus) / 100;
    await this.userRepo.save(user);

    const txData = this.txRepo.create({
      receiverId: targetUserId,
      amountInKurus,
      type: TransactionType.DEPOSIT,
      category: 'bakiye_yukleme',
      description: `Bakiye Yüklendi (Admin)`,
    });

    const savedTx: Transaction = await this.txRepo.save(txData);

    return {
      message: 'Bakiye yükleme başarılı',
      newBalance: user.balance,
      transaction: savedTx,
    };
  }

  // 4. Tüm İşlemleri Getir (Admin)
  async getAllTransactions(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedTransactions> {
    const [data, total] = await this.txRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  // 5. Kullanıcının Kendi İşlem Geçmişi
  async getUserTransactions(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedTransactions> {
    const [data, total] = await this.txRepo.findAndCount({
      where: [{ senderId: userId }, { receiverId: userId }],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }
}

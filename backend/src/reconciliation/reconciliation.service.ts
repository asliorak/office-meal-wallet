export interface ReconciliationItem {
  userId: number;
  email: string;
  actualBalanceTL: number;
  calculatedBalanceTL: number;
  status: 'OK' | 'MISMATCH';
  differenceTL: number;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
} from '../transactions/transaction.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async runReconciliation() {
    const users = await this.userRepo.find();
    const transactions = await this.txRepo.find();

    const details = users.map((user) => {
      // 🎯 Kullanıcının varsayılan başlangıç bakiyesi
      let calculatedBalanceTL = 2500;

      transactions.forEach((tx) => {
        const amountTL = tx.amountInKurus / 100;

        // Ödeme yapılmışsa bakiyeden düş
        if (tx.type === TransactionType.PAYMENT && tx.senderId === user.id) {
          calculatedBalanceTL -= amountTL;
        }
        // Bakiye yüklenmişse bakiyeye ekle
        else if (
          tx.type === TransactionType.DEPOSIT &&
          tx.receiverId === user.id
        ) {
          calculatedBalanceTL += amountTL;
        }
        // Transfer durumları
        else if (tx.type === TransactionType.TRANSFER) {
          if (tx.senderId === user.id) calculatedBalanceTL -= amountTL;
          if (tx.receiverId === user.id) calculatedBalanceTL += amountTL;
        }
      });

      const differenceTL = Math.abs(user.balance - calculatedBalanceTL);
      const status = differenceTL === 0 ? 'MATCH' : 'MISMATCH';

      return {
        userId: user.id,
        email: user.email,
        actualBalanceTL: user.balance,
        calculatedBalanceTL,
        status,
        differenceTL,
      };
    });

    const hasDiscrepancy = details.some((d) => d.status === 'MISMATCH');

    return {
      timestamp: new Date().toISOString(),
      totalUsersChecked: users.length,
      hasDiscrepancy,
      details,
    };
  }
}

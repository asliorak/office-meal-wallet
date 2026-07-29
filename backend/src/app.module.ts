import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './auth/user.entity';
import { Transaction } from './transactions/transaction.entity';
import { IdempotencyKey } from './transactions/idempotency.entity';

import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';

import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';

import { ReconciliationController } from './reconciliation/reconciliation.controller';
import { ReconciliationService } from './reconciliation/reconciliation.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Transaction, IdempotencyKey]),
    AuthModule,
  ],
  controllers: [
    AppController,
    UsersController,
    TransactionsController,
    ReconciliationController,
  ],
  providers: [AppService, TransactionsService, ReconciliationService],
})
export class AppModule {}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  TransactionsService,
  TransactionResult,
  PaginatedTransactions,
} from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('pay')
  async makePayment(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: Record<string, unknown>,
  ): Promise<TransactionResult> {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header eksik!');
    }

    const userId = Number(body.userId);
    const category = String(body.category || '');
    const amountTL = Number(body.amountTL);

    return await this.transactionsService.makePayment(
      userId,
      category,
      amountTL,
    );
  }

  @Post('transfer')
  async transferToFriend(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: Record<string, unknown>,
  ): Promise<TransactionResult> {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header eksik!');
    }

    const senderId = Number(body.senderId);
    const receiverId = Number(body.receiverId);
    const amountTL = Number(body.amountTL);

    return await this.transactionsService.transferToFriend(
      senderId,
      receiverId,
      amountTL,
    );
  }

  @Post('deposit')
  async depositBalance(
    @Body() body: Record<string, unknown>,
  ): Promise<TransactionResult> {
    const targetUserId = Number(body.targetUserId);
    const amountTL = Number(body.amountTL);

    return await this.transactionsService.depositBalance(
      targetUserId,
      amountTL,
    );
  }

  @Get('all')
  async getAllTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PaginatedTransactions> {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    return await this.transactionsService.getAllTransactions(pageNum, limitNum);
  }

  @Get('my-history')
  async getMyTransactions(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PaginatedTransactions> {
    const userIdNum = Number(userId);
    const pageNum = Number(page);
    const limitNum = Number(limit);

    return await this.transactionsService.getUserTransactions(
      userIdNum,
      pageNum,
      limitNum,
    );
  }
}

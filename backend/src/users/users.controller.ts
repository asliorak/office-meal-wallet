import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 1. Tüm kullanıcıları getir (Admin Paneli için)
  @Get()
  async getAllUsers() {
    return await this.userRepository.find({
      select: {
        id: true,
        email: true,
        balance: true,
        role: true,
      },
    });
  }

  // 2. Admin'in seçtiği kullanıcıya bakiye yüklemesi
  @Patch(':id/add-balance')
  async addBalance(@Param('id') id: string, @Body('amount') amount: number) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    user.balance = Number(user.balance) + Number(amount);
    await this.userRepository.save(user);

    return { message: 'Bakiye başarıyla yüklendi', balance: user.balance };
  }
}

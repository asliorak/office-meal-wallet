import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  async findAll() {
    const users = await this.userRepository.find();
    return users.map((u) => ({
      id: u._id ? u._id.toString() : '',
      _id: u._id ? u._id.toString() : '',
      email: u.email,
      balance: u.balance,
      role: u.role || 'USER',
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const users = await this.userRepository.find();
    const user = users.find((u) => u._id && u._id.toString() === id);
    if (!user) return null;

    return {
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      balance: user.balance,
      role: user.role || 'USER',
    };
  }
}

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(email: string, password: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Bu e-posta adresi zaten kullanımda!');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      passwordHash,
      balance: 2500,
    });

    await this.userRepository.save(newUser);
    return { message: 'Kayıt başarılı!' };
  }

  // backend/src/auth/auth.service.ts

  async login(email: string, password: string) {
    // 1. Kullanıcıyı bul
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı!');
    }

    // 2. Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı!');
    }
    console.log('Veritabanından Çekilen User Objesi:', user);

    return {
      message: 'Giriş başarılı!',
      user: {
        id: user.id,
        email: user.email,
        balance: user.balance,
        role: user.role,
      },
    };
  }
}

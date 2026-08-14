import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

export interface AuthDto {
  email?: string;
  password?: string;
  passwordHash?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: AuthDto) {
    const email = dto?.email || '';
    const rawPassword = dto?.password || dto?.passwordHash || '';

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılmaktadır!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    const newUser = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      balance: 2500,
      role: dto?.role || 'USER',
    });

    await this.userRepository.save(newUser);
    return { message: 'Kayıt başarılı!' };
  }

  async login(dto: AuthDto) {
    const email = dto?.email || '';
    const password = dto?.password || dto?.passwordHash || '';

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = this.userRepository.create({
        email,
        passwordHash: hashedPassword,
        balance: 2500,
        role: 'USER',
      });

      user = await this.userRepository.save(newUser);
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Şifre hatalı!');
      }
    }

    const userIdStr = user._id ? user._id.toString() : '';

    return {
      message: 'Giriş başarılı!',
      user: {
        id: userIdStr,
        _id: userIdStr,
        email: user.email,
        balance: user.balance,
        role: user.role || 'USER',
      },
    };
  }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
    });

    await this.userRepository.save(user);

    return {
      message: 'Registered successfully',
    };
  }

  async login(dto: LoginDto, res: any) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const match = await bcrypt.compare(dto.password, user.password);

    if (!match) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const isProduction = process.env.NODE_ENV === 'production';

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefresh;

    await this.userRepository.save(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      maxAge: 60000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
    };
  }

  async refresh(refreshToken: string, res: any) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const isValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException();
      }

      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '1m',
        },
      );

      // Refresh Token Rotation: Generate a new refresh token
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      // Update user with new hashed refresh token
      const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
      user.refreshToken = hashedRefresh;
      await this.userRepository.save(user);

      const isProduction = process.env.NODE_ENV === 'production';

      // Update cookies
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        maxAge: 60000,
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}

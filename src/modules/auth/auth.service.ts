import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshToken, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../logging/logging.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 7; // 7 days

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  async createAccount(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, password } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      this.logger.warn('User already exists');
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        lastClaimedAt: new Date(0),
      },
    });

    this.logger.log(`User created: ${email}`);
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    const { email, password } = loginUserDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.log('The user with this email or password is wrong');
      return null;
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      this.logger.log('The user with this email or password is wrong');
      return null;
    }

    const { password: _, ...result } = user;
    this.logger.log(`User validated: ${email}`);
    return result;
  }

  async login(user: Omit<User, 'password'>): Promise<{
    access_token: string;
    refresh_token: string;
    refresh_token_id: string;
  }> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      audience: 'intelytics',
    });

    const { token: refreshToken, id: refreshTokenId } =
      await this.generateRefreshToken(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      refresh_token_id: refreshTokenId,
    };
  }

  async refreshToken(
    tokenId: string,
    token: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    refresh_token_id: string;
  }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
      include: { user: true },
    });

    if (
      !refreshToken ||
      refreshToken.token !== token ||
      refreshToken.expires < new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { user } = refreshToken;
    const { password: _, ...userWithoutPassword } = user;

    // Delete the old refresh token
    await this.prisma.refreshToken.delete({ where: { id: refreshToken.id } });

    // Generate new tokens
    return this.login(userWithoutPassword);
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    this.logger.log(`User logged out: ${userId}`);
  }

  private async generateRefreshToken(userId: number): Promise<RefreshToken> {
    const token = uuidv4();
    const expires = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRATION * 1000);

    return this.prisma.refreshToken.create({
      data: {
        token,
        expires,
        userId,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}

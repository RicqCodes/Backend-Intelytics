import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async getUser(id: number): Promise<Omit<User, 'password'>> {
    const { password, ...user } = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async addEmeralds(id: number, amount: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { emeralds: { increment: amount } },
    });
  }

  async updateStreak(id: number): Promise<User> {
    const user = await this.getUser(id);
    const now = new Date();
    const lastClaimed = new Date(user.lastClaimedAt);

    // Check if the last claim was yesterday
    const isConsecutiveDay =
      now.getDate() - lastClaimed.getDate() === 1 ||
      (now.getDate() === 1 && lastClaimed.getMonth() !== now.getMonth());

    return this.prisma.user.update({
      where: { id },
      data: {
        currentStreak: isConsecutiveDay ? { increment: 1 } : 1,
        lastClaimedAt: now,
      },
    });
  }

  async getAllUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
}

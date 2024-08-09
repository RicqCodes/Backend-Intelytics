import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const REWARD_ARRAY = [
  { day: 1, reward: 10 },
  { day: 2, reward: 20 },
  { day: 3, reward: 30 },
  { day: 4, reward: 40 },
  { day: 5, reward: 50 },
  { day: 6, reward: 60 },
  { day: 7, reward: 100 },
];

@Injectable()
export class ClaimService {
  constructor(private prisma: PrismaService) {}

  async claim(
    userId: number,
    day: number,
  ): Promise<{
    message: string;
    currentStreak: number;
    emeraldsEarned: number;
  }> {
    const claimDay = this.validateDay(day);
    const { currentStreak, lastClaimedAt } = await this.getStreak(userId);

    this.validateClaimDay(claimDay, currentStreak);
    this.validateClaimDate(lastClaimedAt);

    const isNewStreak = this.isNewStreakClaim(lastClaimedAt);
    const newStreak = isNewStreak ? 1 : currentStreak + 1;
    const emeraldsEarned = REWARD_ARRAY[claimDay - 1].reward;

    await this.updateUserAndCreateClaim(
      userId,
      newStreak,
      emeraldsEarned,
      claimDay,
    );

    return {
      message: 'Claim successful',
      currentStreak: newStreak,
      emeraldsEarned,
    };
  }

  async getStreak(
    userId: number,
  ): Promise<{ currentStreak: number; lastClaimedAt: Date }> {
    const user = await this.getUser(userId);
    return {
      currentStreak: user.currentStreak,
      lastClaimedAt: new Date(user.lastClaimedAt),
    };
  }

  private validateDay(day: number): number {
    const claimDay = Number(day);
    if (isNaN(claimDay) || claimDay < 1 || claimDay > REWARD_ARRAY.length) {
      throw new BadRequestException('Invalid day format');
    }
    return claimDay;
  }

  private async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private validateClaimDay(claimDay: number, currentStreak: number) {
    if (claimDay !== currentStreak + 1) {
      throw new BadRequestException('You are claiming for the wrong day!');
    }
  }

  private validateClaimDate(lastClaimedAt: Date) {
    const now = new Date();
    const lastClaimDate = new Date(lastClaimedAt);
    console.log(now, lastClaimDate);
    if (this.isSameDay(now, lastClaimDate)) {
      throw new BadRequestException(
        'You have already claimed today. Please try again tomorrow.',
      );
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  private isNewStreakClaim(lastClaimedAt: Date): boolean {
    const now = new Date();
    const lastClaimDate = new Date(lastClaimedAt);
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // Check if more than 48 hours have passed or if it's not yesterday
    return (
      now.getTime() - lastClaimDate.getTime() > 2 * oneDayInMs ||
      now.getUTCDate() - lastClaimDate.getUTCDate() > 1
    );
  }

  private async updateUserAndCreateClaim(
    userId: number,
    newStreak: number,
    emeraldsEarned: number,
    claimDay: number,
  ) {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          lastClaimedAt: now,
          emeralds: { increment: emeraldsEarned },
        },
      }),
      this.prisma.claim.create({
        data: {
          userId,
          day: claimDay,
        },
      }),
    ]);
  }
}

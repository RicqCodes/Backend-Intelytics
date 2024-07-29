import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClaimService {
  constructor(private prisma: PrismaService) {}

  async claim(userId: number, day: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const curStreak = (await this.getStreak(userId)).currentStreak + 1;

    if (day !== curStreak) {
      throw new BadRequestException('You are claiming for the wrong day!');
    }

    const now = new Date();
    const lastClaimedAt = new Date(user.lastClaimedAt);
    const timeDifference = now.getTime() - lastClaimedAt.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    if (hoursDifference < 24) {
      throw new BadRequestException('You can only claim once every 24 hours.');
    }

    if (hoursDifference >= 48) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentStreak: 1, lastClaimedAt: now },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentStreak: { increment: 1 }, lastClaimedAt: now },
      });
    }

    await this.prisma.claim.create({
      data: {
        userId,
        day,
      },
    });

    return { message: 'Claim successful' };
  }

  async getStreak(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const lastClaimedAt = new Date(user.lastClaimedAt);

    return {
      currentStreak: user.currentStreak,
      lastClaimedAt: lastClaimedAt,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StreakResetService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 0 * * *') // This cron expression represents every day at midnight
  async resetStreaks() {
    const users = await this.prisma.user.findMany();
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    for (const user of users) {
      const lastClaimedAt = new Date(user.lastClaimedAt);

      if (
        now.getTime() - lastClaimedAt.getTime() > 2 * oneDayInMs ||
        now.getUTCDate() - lastClaimedAt.getUTCDate() > 1
      ) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: 0 },
        });
      }
    }
  }
}

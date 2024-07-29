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

    for (const user of users) {
      const lastClaimedAt = new Date(user.lastClaimedAt);
      const timeDifference = now.getTime() - lastClaimedAt.getTime();
      const hoursDifference = timeDifference / (1000 * 3600);

      if (hoursDifference >= 48) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: 0 },
        });
      }
    }
  }
}

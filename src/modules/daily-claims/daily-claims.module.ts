import { Module } from '@nestjs/common';
import { ClaimService } from './daily-claims.service';
import { ClaimController } from './daily-claims.controller';
import { StreakResetService } from './streak-reset';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ClaimService, PrismaService, StreakResetService],
  controllers: [ClaimController],
})
export class DailyClaimsModule {}

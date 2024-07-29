import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DailyClaimsModule } from './modules/daily-claims/daily-claims.module';
import { TokenPairsModule } from './modules/token-pairs/token-pairs.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggingModule } from './modules/logging/logging.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DailyClaimsModule,
    TokenPairsModule,
    PrismaModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

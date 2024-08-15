import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DailyClaimsModule } from './modules/daily-claims/daily-claims.module';
import { TokenPairsModule } from './modules/token-pairs/token-pairs.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggingModule } from './modules/logging/logging.module';
import { CorsMiddleware } from './cors/cors.middleware';
import { CosmwasmConnectionManagerService } from './cosmwasm-connection-manager/cosmwasm-connection-manager.service';

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
  providers: [AppService, CosmwasmConnectionManagerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*'); // Apply to all routes
  }
}

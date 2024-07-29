import { Module } from '@nestjs/common';
import { TokenPairsController } from './token-pairs.controller';
import { TokenPairsService } from './token-pairs.service';

@Module({
  controllers: [TokenPairsController],
  providers: [TokenPairsService]
})
export class TokenPairsModule {}

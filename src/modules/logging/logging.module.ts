import { Module } from '@nestjs/common';
import { LoggerService } from './logging.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggingModule {}

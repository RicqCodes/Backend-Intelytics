import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';

@Module({
  providers: [UserService, PrismaService],
  controllers: [UserController],
})
export class UsersModule {}

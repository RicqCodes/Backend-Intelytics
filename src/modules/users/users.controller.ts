import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Request,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '@prisma/client';

import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUser(@Request() req): Promise<User> {
    return this.userService.getUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(Number(id), updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/emeralds')
  async addEmeralds(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<User> {
    return this.userService.addEmeralds(Number(id), amount);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/streak')
  async updateStreak(@Param('id') id: string): Promise<User> {
    return this.userService.updateStreak(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUsers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
  ): Promise<User[]> {
    return this.userService.getAllUsers({
      skip: Number(skip) || undefined,
      take: Number(take) || undefined,
      orderBy: orderBy ? { [orderBy]: 'asc' } : undefined,
    });
  }
}

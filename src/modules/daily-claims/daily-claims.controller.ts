import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ClaimService } from './daily-claims.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('claim')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':day')
  async claim(@Req() req, @Param('day') day: number) {
    const userId = req.user.id;

    // Ensure day is within valid range
    if (day < 1 || day > 7) {
      throw new BadRequestException('Invalid day for claim.');
    }

    return this.claimService.claim(userId, day);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('streak')
  async getStreak(@Req() req) {
    const userId = req.user.id;
    return this.claimService.getStreak(userId);
  }
}

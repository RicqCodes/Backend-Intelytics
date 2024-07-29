import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.createAccount(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response) {
    const { access_token, refresh_token, refresh_token_id } =
      await this.authService.login(req.user);

    // Set refresh token ID in an HTTP-only cookie
    response.cookie('refresh_token_id', refresh_token_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use secure cookies in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { access_token, refresh_token };
  }

  @Post('refresh')
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
    @Req() request,
    @Res({ passthrough: true }) response,
  ) {
    const refreshTokenId = request.cookies['refresh_token_id'];
    if (!refreshTokenId) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { access_token, refresh_token, refresh_token_id } =
        await this.authService.refreshToken(
          refreshTokenId,
          refreshTokenDto.refresh_token,
        );

      // Update the refresh token ID cookie
      response.cookie('refresh_token_id', refresh_token_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { access_token, refresh_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response) {
    await this.authService.logout(req.user.id);
    response.clearCookie('refresh_token_id');
    return { message: 'Logged out successfully' };
  }
}

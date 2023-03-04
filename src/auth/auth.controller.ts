import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GetCookies } from '../decorators/cookies.decorator';
import { Response } from 'express';
import { CheckUserDataDto } from './dto/check-user-data.dto';
import { RecoveryDto } from './dto/recovery.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/registration')
  async registration(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userData = await this.authService.registration(dto);
    response.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }

  @Post('/login')
  async login(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userData = await this.authService.login(dto);
    response.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }

  @Post('/logout')
  async logout(
    @GetCookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refreshToken');
    return this.authService.logout(refreshToken);
  }

  @Get('/refresh')
  async refresh(
    @GetCookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userData = await this.authService.refresh(refreshToken);
    response.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }
}

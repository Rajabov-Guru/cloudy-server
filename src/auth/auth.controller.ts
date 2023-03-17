import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GetCookies } from '../decorators/cookies.decorator';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация' })
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

  @ApiOperation({ summary: 'Логин' })
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

  @ApiOperation({ summary: 'Логоут' })
  @Post('/logout')
  async logout(
    @GetCookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refreshToken');
    return this.authService.logout(refreshToken);
  }

  @ApiOperation({ summary: 'Рефреш' })
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

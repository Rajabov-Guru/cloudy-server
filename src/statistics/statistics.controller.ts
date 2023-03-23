import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCloud } from '../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';
import { StatisticsService } from './statistics.service';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  @ApiOperation({ summary: 'Получить статистику' })
  @ApiOkResponse({ status: 200 })
  @Get()
  async getStatistic(@GetCloud() cloud: Cloud) {
    return this.statisticsService.getByCloud(cloud.id);
  } //?

  @ApiOperation({ summary: 'Получить результаты анализа' })
  @ApiOkResponse({ status: 200 })
  @Get('analise')
  async getAnalise(@GetCloud() cloud: Cloud) {
    return this.statisticsService.getStatItems(cloud.id);
  } //?

  @ApiOperation({ summary: 'Сделать анализ хранилища' })
  @ApiOkResponse({ status: 200 })
  @Post('analise')
  async makeAnalise(@GetCloud() cloud: Cloud) {
    return this.statisticsService.analiseByCategories(cloud.id);
  } //?
}

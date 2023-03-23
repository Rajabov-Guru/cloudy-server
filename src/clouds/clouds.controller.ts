import { Controller, UseGuards, Get } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCloud } from '../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';

@ApiTags('Clouds')
@Controller('clouds')
@UseGuards(JwtAuthGuard)
export class CloudsController {
  constructor(private readonly cloudsService: CloudsService) {}

  @ApiOperation({ summary: 'Получить хранилище' })
  @ApiOkResponse({ status: 200 })
  @Get()
  getOne(@GetCloud() cloud: Cloud) {
    return cloud;
  } //?
}

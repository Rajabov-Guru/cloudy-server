import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CreateCloudDto } from './dto/create-cloud.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clouds')
@UseGuards(JwtAuthGuard)
export class CloudsController {
  constructor(private readonly cloudsService: CloudsService) {}

  @Post()
  create(@Body() createCloudDto: CreateCloudDto) {
    return this.cloudsService.create(createCloudDto);
  }
}

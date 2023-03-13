import { Controller, Post, Body } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CreateCloudDto } from './dto/create-cloud.dto';

@Controller('clouds')
export class CloudsController {
  constructor(private readonly cloudsService: CloudsService) {}

  @Post()
  create(@Body() createCloudDto: CreateCloudDto) {
    return this.cloudsService.create(createCloudDto);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CreateCloudDto } from './dto/create-cloud.dto';
import { UpdateCloudDto } from './dto/update-cloud.dto';

@Controller('clouds')
export class CloudsController {
  constructor(private readonly cloudsService: CloudsService) {}

  @Post()
  create(@Body() createCloudDto: CreateCloudDto) {
    return this.cloudsService.create(createCloudDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cloudsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCloudDto: UpdateCloudDto) {
    return this.cloudsService.update(+id, updateCloudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cloudsService.remove(+id);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TrashService } from '../services/trash.service';
import { UnTrashDto } from '../dto/untrash.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InnersDto } from '../dto/inners.dto';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';

@ApiTags('Trash')
@Controller('drive/trash')
@UseGuards(JwtAuthGuard)
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @ApiOperation({ summary: 'Получить содержимое корзины' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get()
  async getAll(@GetCloud() cloud: Cloud) {
    return this.trashService.getAll(cloud.id);
  } //?

  @ApiOperation({ summary: 'Восставновить папку или файл' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 201 })
  @Post()
  async unTrash(@Body() dto: UnTrashDto) {
    if (dto.dir) {
      return this.trashService.unTrashFolder(dto.targetId);
    }
    return this.trashService.unTrashFile(dto.targetId);
  } //?
}

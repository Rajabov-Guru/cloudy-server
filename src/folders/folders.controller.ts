import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GetCloud } from '../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';
import { FoldersService } from './folders.service';
import { RenameDto } from './dto/rename.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}
  @Post()
  async create(@Body() dto: CreateFolderDto, @GetCloud() cloud: Cloud) {
    return this.foldersService.create(dto, cloud.id);
  }

  @Put()
  async rename(@Body() dto: RenameDto) {
    return this.foldersService.rename(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.foldersService.delete(+id);
  }
}

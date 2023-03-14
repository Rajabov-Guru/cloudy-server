import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GetCloud } from '../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';
import { FoldersService } from './folders.service';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplaceFolderDto } from './dto/replace-folder.dto';
import { CopyFolderDto } from './dto/copy-folder.dto';
import { CloudName } from '../decorators/cloud-name.decorator';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}
  @Post()
  async create(@Body() dto: CreateFolderDto, @GetCloud() cloud: Cloud) {
    return this.foldersService.create(dto, cloud.id);
  }
  @Post('replace')
  async replace(@Body() dto: ReplaceFolderDto) {
    return this.foldersService.replace(dto.folderId, dto.newParentId);
  }
  @Post('copy')
  async copy(@Body() dto: CopyFolderDto, @CloudName() cloudName: string) {
    return this.foldersService.copy(cloudName, dto);
  }
  @Put()
  async rename(@Body() dto: RenameFolderDto) {
    return this.foldersService.rename(dto);
  }
  @Get(':id')
  async getFolder(@Param('id') id: string) {
    return this.foldersService.getFolderInners(+id);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.foldersService.delete(+id);
  }
}

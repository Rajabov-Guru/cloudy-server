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
import { Cloud } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FoldersService } from '../services/folders.service';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { ReplaceDto } from '../dto/replace.dto';
import { CopyDto } from '../dto/copy.dto';
import { CloudName } from '../../decorators/cloud-name.decorator';
import { RenameDto } from '../dto/rename.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InnersDto } from '../dto/inners.dto';

@ApiTags('Folders')
@Controller('drive/folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiOperation({ summary: 'Создать папку' })
  @ApiOkResponse({ status: 200 })
  @Post()
  async create(@Body() dto: CreateFolderDto, @GetCloud() cloud: Cloud) {
    return this.foldersService.create(dto, cloud.id);
  }

  @ApiOperation({ summary: 'Получить корень хранилища' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get('root')
  async getRoot() {
    return this.foldersService.getRoot();
  }

  @ApiOperation({ summary: 'Переместить папку' })
  @ApiOkResponse({ status: 200 })
  @Post('replace')
  async replace(@Body() dto: ReplaceDto) {
    return this.foldersService.replace(dto.targetId, dto.newParentId);
  }

  @ApiOperation({ summary: 'Копировать папку' })
  @ApiOkResponse({ status: 200 })
  @Post('copy')
  async copy(@Body() dto: CopyDto, @CloudName() cloudName: string) {
    return this.foldersService.copy(cloudName, dto);
  }

  @ApiOperation({ summary: 'Переименовать' })
  @ApiOkResponse({ status: 200 })
  @Put('rename')
  async rename(@Body() dto: RenameDto) {
    return this.foldersService.rename(dto);
  }

  @ApiOperation({ summary: 'Добавить в избранное' })
  @ApiOkResponse({ status: 200 })
  @Post('favorites/:id')
  async addToFavorites(@Param('id') id: number) {
    return this.foldersService.favorites(+id);
  }

  @ApiOperation({ summary: 'Закрепить' })
  @ApiOkResponse({ status: 200 })
  @Post('pin/:id')
  async pinFolder(@Param('id') id: number) {
    return this.foldersService.pin(+id);
  }

  @ApiOperation({ summary: 'Заблокировать' })
  @ApiOkResponse({ status: 200 })
  @Post('freeze/:id')
  async freezeFolder(@Param('id') id: number) {
    return this.foldersService.freeze(+id);
  }

  @ApiOperation({ summary: 'Получить содержимое папки' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get(':id')
  async getFolder(@Param('id') id: string) {
    return this.foldersService.getFolderInners(+id);
  }

  @ApiOperation({ summary: 'Удалить папку' })
  @ApiOkResponse({ status: 200 })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.foldersService.delete(+id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessAction, Cloud } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FoldersService } from '../services/folders.service';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InnersDto } from '../dto/inners.dto';
import { IsFolderEndpoint } from '../../decorators/is-folder-endpoint.decorator';
import { CheckFrozenGuard } from '../guards/check-frozen.guard';
import { AccessGuard } from '../guards/access.guard';
import { ShareDto } from '../dto/share.dto';
import { TrashService } from '../services/trash.service';
import { AccessMode } from '../../decorators/access-mode.decorator';
import { CreateFolderGuard } from '../guards/create-folder.guard';

@ApiTags('Folders')
@Controller('drive/folders')
@IsFolderEndpoint(true)
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly trashService: TrashService,
  ) {}

  @ApiOperation({ summary: 'Создать папку' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(CreateFolderGuard)
  @Post()
  async create(@Body() dto: CreateFolderDto, @GetCloud() cloud: Cloud) {
    try {
      return this.foldersService.create(dto, cloud.id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Переместить папку' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('replace/:id/:parent')
  async replace(@Param('id') id: string, @Param('parent') parent: string) {
    try {
      const parentId = !isNaN(+parent) ? +parent : null;
      return this.foldersService.replace(+id, parentId);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Копировать папку' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('copy/:id/:parent')
  async copy(@Param('id') id: string, @Param('parent') parent: string) {
    try {
      const parentId = !isNaN(+parent) ? +parent : null;
      return this.foldersService.copy(+id, parentId);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Переименовать' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('rename/:id/:newName')
  async rename(@Param('id') id: string, @Param('newName') newName: string) {
    try {
      return this.foldersService.rename(+id, newName);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Добавить в избранное' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('favorites/:id')
  async addToFavorites(@Param('id') id: string) {
    try {
      return this.foldersService.favorites(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Закрепить' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('pin/:id')
  async pinFolder(@Param('id') id: string) {
    try {
      return this.foldersService.pin(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Заблокировать' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('freeze/:id')
  async freezeFolder(@Param('id') id: string) {
    try {
      return this.foldersService.freeze(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Получить содержимое папки' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard)
  @Get(':path')
  async getFolder(@Param('path') path: string, @GetCloud() cloud: Cloud) {
    try {
      return this.foldersService.getFolderInners(cloud.id, path);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Удалить папку' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return this.foldersService.delete(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Восстановить папку' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('restore/:id')
  async restore(@Param('id') id: string) {
    try {
      return this.trashService.unTrashFolder(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Настройка доступа к папке' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('share/:id')
  async share(@Param('id') id: string, @Body() dto: ShareDto) {
    try {
      return this.foldersService.shareFolder(+id, dto);
    } catch (error) {
      throw error;
    }
  }
}

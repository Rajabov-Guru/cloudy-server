import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { getType } from 'mime';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FilesService } from '../services/files.service';
import { FsService } from '../../global-services/fs.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { AccessAction, Cloud } from '@prisma/client';
import { IsFolderEndpoint } from '../../decorators/is-folder-endpoint.decorator';
import { CheckFrozenGuard } from '../guards/check-frozen.guard';
import { AccessGuard } from '../guards/access.guard';
import { ShareDto } from '../dto/share.dto';
import { TrashService } from '../services/trash.service';
import { AccessMode } from '../../decorators/access-mode.decorator';
import { LoadFilesGuard } from '../guards/load-files.guard';

@ApiTags('Files')
@Controller('drive/files')
@IsFolderEndpoint(false)
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly fsService: FsService,
    private readonly trashService: TrashService,
  ) {}

  @ApiOperation({ summary: 'Загрузить файлы' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(LoadFilesGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('load/:parent')
  async loadFiles(
    @Param('parent') parent: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetCloud() cloud: Cloud,
  ) {
    try {
      const parentId = !isNaN(+parent) ? +parent : null;
      return this.filesService.saveFiles(parentId, files, cloud);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Переместить файл' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('replace/:id/:parent')
  async replace(@Param('id') id: string, @Param('parent') parent: string) {
    try {
      return this.filesService.replace(+id, !isNaN(+parent) ? +parent : null);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Копировать файл' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('copy/:id/:parent')
  async copy(@Param('id') id: string, @Param('parent') parent: string) {
    try {
      return this.filesService.copy(+id, !isNaN(+parent) ? +parent : null);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Переименовать файл' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('rename/:id/:newName')
  async rename(@Param('id') id: string, @Param('newName') newName: string) {
    try {
      return this.filesService.rename(+id, newName);
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
      return this.filesService.favorites(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Закрепить' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('pin/:id')
  async pinFile(@Param('id') id: string) {
    try {
      return this.filesService.pin(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Заблокировать' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('freeze/:id')
  async freezeFile(@Param('id') id: string) {
    try {
      return this.filesService.freeze(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Удалить' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(AccessAction.EDIT)
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return this.filesService.delete(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Восставновить' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('restore/:id')
  async restore(@Param('id') id: string) {
    try {
      return this.trashService.unTrashFile(+id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Получить файл' })
  @ApiOkResponse({ status: 200, type: StreamableFile })
  @AccessMode(AccessAction.READ)
  @UseGuards(AccessGuard)
  @Get(':path')
  async getFile(
    @Res({ passthrough: true }) res: Response,
    @Param('path') path: string,
  ): Promise<StreamableFile> {
    try {
      const result = await this.filesService.streamFilePath(path);
      const file = createReadStream(result.pathName);
      const contentType = getType(result.extension);
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${result.name}"`,
      });
      return new StreamableFile(file);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Настройка доступа к файлу' })
  @ApiOkResponse({ status: 200 })
  @AccessMode(null)
  @UseGuards(AccessGuard)
  @Post('share/:id')
  async share(@Param('id') id: string, @Body() dto: ShareDto) {
    try {
      return this.filesService.shareFile(+id, dto);
    } catch (error) {
      throw error;
    }
  } //?
}

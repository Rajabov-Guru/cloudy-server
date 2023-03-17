import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FilesService } from '../services/files.service';
import { FsService } from '../../global-services/fs.service';
import { LoadFilesDto } from '../dto/load-files.dto';
import { CloudName } from '../../decorators/cloud-name.decorator';
import { ReplaceDto } from '../dto/replace.dto';
import { CopyDto } from '../dto/copy.dto';
import { RenameDto } from '../dto/rename.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('drive/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly fsService: FsService,
  ) {}

  @ApiOperation({ summary: 'Загрузить файлы' })
  @ApiOkResponse({ status: 200 })
  @UseInterceptors(FilesInterceptor('files'))
  @Post('load')
  async loadFiles(
    @Body() dto: LoadFilesDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CloudName() cloudName: string,
  ) {
    const sumSize = files.reduce((sum, f) => f.size + sum, 0);
    return this.filesService.saveFiles(dto, files, cloudName);
  }

  @ApiOperation({ summary: 'Переместить файл' })
  @ApiOkResponse({ status: 200 })
  @Post('replace')
  async replace(@Body() dto: ReplaceDto, @CloudName() cloudName: string) {
    return this.filesService.replace(cloudName, dto.targetId, dto.newParentId);
  }

  @ApiOperation({ summary: 'Копировать файл' })
  @ApiOkResponse({ status: 200 })
  @Post('copy')
  async copy(@Body() dto: CopyDto, @CloudName() cloudName: string) {
    return this.filesService.copy(cloudName, dto.targetId, dto.parentId);
  }

  @ApiOperation({ summary: 'Переименовать файл' })
  @ApiOkResponse({ status: 200 })
  @Put('rename')
  async rename(@Body() dto: RenameDto, @CloudName() cloudName: string) {
    return this.filesService.renameFile(cloudName, dto);
  }

  @ApiOperation({ summary: 'Добавить в избранное' })
  @ApiOkResponse({ status: 200 })
  @Post('favorites/:id')
  async addToFavorites(@Param('id') id: number) {
    return this.filesService.favorites(+id);
  }

  @ApiOperation({ summary: 'Закрепить' })
  @ApiOkResponse({ status: 200 })
  @Post('pin/:id')
  async pinFile(@Param('id') id: number) {
    return this.filesService.pin(+id);
  }

  @ApiOperation({ summary: 'Заблокировать' })
  @ApiOkResponse({ status: 200 })
  @Post('freeze/:id')
  async freezeFile(@Param('id') id: number) {
    return this.filesService.freeze(+id);
  }

  @ApiOperation({ summary: 'Удалить' })
  @ApiOkResponse({ status: 200 })
  @Delete(':id')
  async delete(@Param('id') id: string, @CloudName() cloudName: string) {
    return this.filesService.delete(cloudName, +id);
  }

  @ApiOperation({ summary: 'Получить файл' })
  @ApiOkResponse({ status: 200, type: StreamableFile })
  @Get(':id')
  async getFile(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @CloudName() cloudName: string,
  ): Promise<StreamableFile> {
    const foundedFile = await this.filesService.findOne(+id);
    const contentType = getType(foundedFile.extension);
    const path = await this.fsService.getFilePath(
      cloudName,
      foundedFile.pathName,
    );
    const file = createReadStream(path);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${foundedFile.name}"`,
    });
    return new StreamableFile(file);
  }
}

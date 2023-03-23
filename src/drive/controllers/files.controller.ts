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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FilesService } from '../services/files.service';
import { FsService } from '../../global-services/fs.service';
import { LoadFilesDto } from '../dto/load-files.dto';
import { CloudName } from '../../decorators/cloud-name.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';
import { FilesException } from '../../exceptions/files.exception';
import { IsFolderEndpoint } from '../../decorators/is-folder-endpoint.decorator';
import { CheckFrozenGuard } from '../guards/check-frozen.guard';
import { AccessGuard } from '../guards/access.guard';
import { ShareDto } from '../dto/share.dto';

@ApiTags('Files')
@Controller('drive/files')
@IsFolderEndpoint(false)
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
    @GetCloud() cloud: Cloud,
  ) {
    const sumSize = files.reduce((sum, f) => f.size + sum, 0);
    const isFull = await this.filesService.isStorageFull(cloud.id, sumSize);
    if (isFull) {
      throw new FilesException('NOT ENOUGH SPACE');
    }
    return this.filesService.saveFiles(dto, files, cloud);
  } //?

  @ApiOperation({ summary: 'Переместить файл' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('replace/:id/:parent')
  async replace(
    @Param('id') id: string,
    @Param('parent') parent: string,
    @CloudName() cloudName: string,
  ) {
    return this.filesService.replace(cloudName, +id, +parent);
  } //?

  @ApiOperation({ summary: 'Копировать файл' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('copy/:id/:parent')
  async copy(
    @Param('id') id: string,
    @Param('parent') parent: string,
    @GetCloud() cloud: Cloud,
  ) {
    return this.filesService.copy(cloud, +id, +parent);
  } //?

  @ApiOperation({ summary: 'Переименовать файл' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('rename/:id/:newName')
  async rename(
    @Param('id') id: string,
    @Param('newName') newName: string,
    @CloudName() cloudName: string,
  ) {
    return this.filesService.rename(cloudName, +id, newName);
  } //?

  @ApiOperation({ summary: 'Добавить в избранное' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('favorites/:id')
  async addToFavorites(@Param('id') id: string) {
    return this.filesService.favorites(+id);
  } //?

  @ApiOperation({ summary: 'Закрепить' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('pin/:id')
  async pinFile(@Param('id') id: string) {
    return this.filesService.pin(+id);
  } //?

  @ApiOperation({ summary: 'Заблокировать' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('freeze/:id')
  async freezeFile(@Param('id') id: string) {
    return this.filesService.freeze(+id);
  } //?

  @ApiOperation({ summary: 'Удалить' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @CloudName() cloudName: string) {
    return this.filesService.delete(cloudName, +id);
  } //?

  @ApiOperation({ summary: 'Получить файл' })
  @ApiOkResponse({ status: 200, type: StreamableFile })
  @UseGuards(AccessGuard)
  @Get(':path')
  async getFile(
    @Res({ passthrough: true }) res: Response,
    @Param('path') path: string,
    @CloudName() cloudName: string,
  ): Promise<StreamableFile> {
    const foundedFile = await this.filesService.findOne(path);
    const contentType = getType(foundedFile.extension);
    const pathName = await this.fsService.getFilePath(
      cloudName,
      foundedFile.pathName,
    );
    const file = createReadStream(pathName);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${foundedFile.name}"`,
    });
    return new StreamableFile(file);
  } //?

  @ApiOperation({ summary: 'Настройка доступа к файлу' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('share/:id')
  async share(@Param('id') id: string, @Body() dto: ShareDto) {
    return this.filesService.shareFile(+id, dto);
  } //?
}

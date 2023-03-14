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
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LoadFilesDto } from './dto/load-files.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createReadStream } from 'fs';
import { CloudName } from '../decorators/cloud-name.decorator';
import { FsService } from '../global-services/fs.service';
import { RenameFileDto } from './dto/rename-file.dto';
import { ReplaceFileDto } from './dto/replace-file.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { getType } from 'mime';
import type { Response } from 'express';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly fsService: FsService,
  ) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Post('load')
  async loadFiles(
    @Body() dto: LoadFilesDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CloudName() cloudName: string,
  ) {
    return this.filesService.saveFiles(dto, files, cloudName);
  }
  @Post('replace')
  async replace(@Body() dto: ReplaceFileDto, @CloudName() cloudName: string) {
    return this.filesService.replace(cloudName, dto.fileId, dto.folderId);
  }
  @Post('copy')
  async copy(@Body() dto: CopyFileDto, @CloudName() cloudName: string) {
    return this.filesService.copy(cloudName, dto.fileId, dto.folderId);
  }
  @Put('rename')
  async rename(@Body() dto: RenameFileDto, @CloudName() cloudName: string) {
    return this.filesService.renameFile(cloudName, dto);
  }
  @Delete(':id')
  async delete(@Param('id') id: string, @CloudName() cloudName: string) {
    return this.filesService.delete(cloudName, +id);
  }
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

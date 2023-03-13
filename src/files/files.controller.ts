import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import * as path from 'path';
import * as process from 'process';
import { RenameDto } from '../folders/dto/rename.dto';
import { GetCloudName } from '../decorators/cloud-name.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Post('load')
  async loadFiles(
    @Body() dto: LoadFilesDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetCloudName() cloudName: string,
  ) {
    return this.filesService.saveFiles(dto, files, cloudName);
  }

  @Put()
  async rename(dto: RenameDto) {
    return this.filesService.renameFile(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.filesService.delete(+id);
  }

  @Get(':id')
  async getFile(@Param('id') id: string): Promise<StreamableFile> {
    const foundedFile = await this.filesService.findOne(+id);
    const file = createReadStream(
      path.resolve(process.cwd(), 'dist', 'static', foundedFile.path),
    );
    return new StreamableFile(file);
  }
}

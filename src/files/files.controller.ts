import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { RenameFileDto } from './dto/rename-file.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { LoadFilesDto } from './dto/load-files.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetCloud } from '../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('dir')
  async createDir(@Body() dto: CreateFileDto, @GetCloud() cloud: Cloud) {
    return this.filesService.createDir(dto, cloud.id);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post('load')
  async loadFiles(
    @Body() dto: LoadFilesDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetCloud() cloud: Cloud,
  ) {
    return this.filesService.saveFiles(dto, files, cloud.id);
  }

  @Post('/rename')
  async rename(@Body() dto: RenameFileDto) {
    return this.filesService.renameFile(dto);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.filesService.delete(+id);
  }
}

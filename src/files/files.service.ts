import { forwardRef, Inject, Injectable, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../global-services/prisma.service';
import * as pathManager from 'path';
import { FilesException } from '../exceptions/files.exception';
import { File } from '@prisma/client';
import { LoadFilesDto } from './dto/load-files.dto';
import { FsService } from '../global-services/fs.service';
import { FoldersService } from '../folders/folders.service';
import { RenameFileDto } from './dto/rename-file.dto';
import { createReadStream } from 'fs';

@Injectable()
export class FilesService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;

  @Inject(FsService)
  private readonly fsService: FsService;

  async findOne(fileId: number) {
    const folder = await this.prisma.file.findFirst({
      where: { id: fileId },
    });
    if (!folder) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return folder;
  }

  async findByFolder(folderId: number) {
    return this.prisma.file.findMany({
      where: { folderId },
    });
  }

  async getFile(cloudName: string, id: number) {
    const foundedFile = await this.findOne(id);
    const path = await this.fsService.getFilePath(
      cloudName,
      foundedFile.pathName,
    );
    const file = createReadStream(path);
    return file;
  }

  async saveFiles(
    dto: LoadFilesDto,
    files: Array<Express.Multer.File>,
    cloudName: string,
  ) {
    const fileItems: File[] = [];
    for (const file of files) {
      const saved = await this.saveSingleFile(dto.parentId, file, cloudName);
      fileItems.push(saved);
    }
    return fileItems;
  }

  async saveSingleFile(
    folderId: number | null,
    file: Express.Multer.File,
    cloudName: string,
  ) {
    const filename = file.originalname;
    const ext = pathManager.extname(filename);
    const pathName = await this.fsService.save(cloudName, file, folderId);
    const saved = await this.prisma.file.create({
      data: {
        name: filename,
        pathName,
        extension: ext,
        size: file.size,
        folderId,
      },
    });
    return saved;
  }

  async renameFile(cloudName: string, dto: RenameFileDto) {
    const file = await this.findOne(dto.fileId);
    const newName = `${dto.newName}${file.extension}`;
    const newPathName = await this.fsService.rename(cloudName, file, newName);
    file.name = newName;
    file.pathName = newPathName;
    return this.update(file);
  }

  async update(data: File) {
    return this.prisma.file.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(cloudName: string, fileId: number) {
    const file = await this.findOne(fileId);
    await this.fsService.delete(cloudName, file.pathName);
    return this.prisma.file.delete({
      where: { id: fileId },
    });
  }

  async deleteAllByFolder(cloudName: string, folderId: number) {
    const files = await this.prisma.file.findMany({
      where: {
        folderId,
      },
    });
    for (const file of files) {
      await this.fsService.delete(cloudName, file.pathName);
    }
  }

  async doubleFile(cloudName: string, file: File, folderId: number) {
    const newPathName = await this.fsService.copy(cloudName, file, folderId);
    return this.prisma.file.create({
      data: {
        name: file.name,
        pathName: newPathName,
        extension: file.extension,
        size: file.size,
        folderId,
      },
    });
  }

  async replace(cloudName: string, fileId: number, newFolderId: number) {
    const file = await this.findOne(fileId);
    const newPathName = await this.fsService.replace(
      cloudName,
      file,
      newFolderId,
    );
    file.folderId = newFolderId;
    file.pathName = newPathName;
    return this.update(file);
  }

  async copy(cloudName: string, fileId: number, folderId: number) {
    const file = await this.findOne(fileId);
    return this.doubleFile(cloudName, file, folderId);
  }
}

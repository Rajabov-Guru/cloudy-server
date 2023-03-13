import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CloudsService } from '../clouds/clouds.service';
import * as pathManager from 'path';
import { FilesException } from '../exceptions/files.exception';
import { File, Folder } from '@prisma/client';
import { LoadFilesDto } from './dto/load-files.dto';
import { FsService } from '../folders/fs.service';
import { RenameDto } from '../folders/dto/rename.dto';
import { FoldersService } from '../folders/folders.service';

@Injectable()
export class FilesService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(FoldersService)
  private readonly foldersService: FoldersService;

  @Inject(forwardRef(() => CloudsService))
  private readonly cloudsService: CloudsService;

  @Inject(forwardRef(() => FsService))
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

  async saveFiles(
    dto: LoadFilesDto,
    files: Array<Express.Multer.File>,
    cloudName: string,
  ) {
    const fileItems: File[] = [];
    for (const file of files) {
      const saved = await this.saveSingleFile(+dto.parentId, file, cloudName);
      fileItems.push(saved);
    }
    return fileItems;
  }

  async saveSingleFile(
    parentId: number | null,
    file: Express.Multer.File,
    cloudName: string,
  ) {
    let parent: Folder | null = null;
    let parentPath = cloudName;
    if (parentId) {
      parent = await this.foldersService.findOne(parentId);
      parentPath = parent.path;
    }
    const filename = file.originalname;
    const ext = pathManager.extname(filename);
    const path = pathManager.join(parentPath, filename);
    await this.fsService.save(file, path);
    const saved = await this.prisma.file.create({
      data: {
        name: filename,
        pathName: filename,
        path: path,
        extension: ext,
        size: file.size,
        folderId: parentId,
      },
    });
    return saved;
  }

  async renameFile(dto: RenameDto) {
    const file = await this.findOne(dto.id);
    file.name = dto.newName;
    return this.update(file);
  }

  async update(data: File) {
    return this.prisma.file.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(fileId: number) {
    const file = await this.findOne(fileId);
    const filePath = this.fsService.resolveFullPath(file.path);
    await this.fsService.delete(filePath);
    return this.prisma.file.delete({
      where: { id: fileId },
    });
  }

  //replace file
  //copy file
}

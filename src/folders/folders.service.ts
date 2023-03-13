import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FsService } from './fs.service';
import * as pathManager from 'path';
import { CloudsService } from '../clouds/clouds.service';
import { FilesException } from '../exceptions/files.exception';
import { Folder } from '@prisma/client';
import { RenameDto } from './dto/rename.dto';

@Injectable()
export class FoldersService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FsService))
  private readonly fsService: FsService;

  @Inject(forwardRef(() => CloudsService))
  private readonly cloudsService: CloudsService;

  async findOne(folderId: number) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: folderId,
      },
    });
    if (!folder) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return folder;
  }

  async update(data: Folder) {
    return this.prisma.folder.update({
      where: { id: data.id },
      data,
    });
  }

  async create(dto: CreateFolderDto, cloudId: number) {
    const cloud = await this.cloudsService.findOne(cloudId);
    let parent: Folder | null = null;
    let parentPath = cloud.name;
    const pathName = dto.name;
    if (dto.parentId) {
      parent = await this.findOne(dto.parentId);
      parentPath = parent.path;
    }
    const path = pathManager.join(parentPath, pathName);
    this.fsService.makeDirectory(path);
    const folder = await this.prisma.folder.create({
      data: {
        name: dto.name,
        cloudId: cloudId,
        parentId: dto.parentId,
        pathName,
        path,
      },
    });
    return folder;
  }

  async rename(dto: RenameDto) {
    const folder = await this.findOne(dto.id);
    folder.name = dto.newName;
    return this.update(folder);
  }

  async delete(folderId: number) {
    const folder = await this.findOne(folderId);
    await this.fsService.delete(folder.path);
    return this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  //reset folder (aka: make it empty)
  //replace folder
  //copy folder
}

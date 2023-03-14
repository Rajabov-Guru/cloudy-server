import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../global-services/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FsService } from '../global-services/fs.service';
import * as pathManager from 'path';
import { CloudsService } from '../clouds/clouds.service';
import { FilesException } from '../exceptions/files.exception';
import { Folder } from '@prisma/client';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { FilesService } from '../files/files.service';
import { CopyFolderDto } from './dto/copy-folder.dto';

@Injectable()
export class FoldersService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(FsService)
  private readonly fsService: FsService;

  @Inject(forwardRef(() => CloudsService))
  private readonly cloudsService: CloudsService;

  @Inject(forwardRef(() => FilesService))
  private readonly filesService: FilesService;

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

  async findChildren(folderId: number) {
    return this.prisma.folder.findMany({
      where: {
        parentId: folderId,
      },
    });
  }

  async getFolderInners(folderId: number) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: folderId,
      },
      include: {
        Children: true,
        Files: true,
      },
    });
    return folder;
  }

  async getSubFolders(folderId: number) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: folderId,
      },
      include: {
        Children: true,
      },
    });
    return folder.Children;
  }

  async update(data: Folder) {
    return this.prisma.folder.update({
      where: { id: data.id },
      data,
    });
  }

  async create(dto: CreateFolderDto, cloudId: number) {
    const folder = await this.prisma.folder.create({
      data: {
        name: dto.name,
        cloudId: cloudId,
        parentId: dto.parentId,
      },
    });
    return folder;
  }

  async rename(dto: RenameFolderDto) {
    const folder = await this.findOne(dto.id);
    folder.name = dto.newName;
    return this.update(folder);
  }

  async delete(folderId: number) {
    const folder = await this.findOne(folderId);
    const cloud = await this.cloudsService.findOne(folder.cloudId);
    await this.deleteFilesRec(cloud.name, folderId);
    return this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  private async deleteFilesRec(cloudName: string, folderId: number) {
    await this.filesService.deleteAllByFolder(cloudName, folderId);
    const subFolders = await this.getSubFolders(folderId);
    for (const subFolder of subFolders) {
      await this.deleteFilesRec(cloudName, subFolder.id);
    }
  }

  async replace(folderId: number, newParentId: number) {
    const folder = await this.findOne(folderId);
    folder.parentId = newParentId;
    return this.update(folder);
  }

  async copy(cloudName: string, dto: CopyFolderDto) {
    const folder = await this.findOne(dto.folderId);
    return this.doubleFolder(cloudName, folder, dto.parentId);
  }

  private async doubleFolder(
    cloudName: string,
    folder: Folder,
    parentId: number,
  ) {
    const data = folder;
    data.parentId = parentId;
    const newFolder = await this.prisma.folder.create({
      data: {
        name: data.name,
        cloudId: data.cloudId,
        parentId: data.parentId,
      },
    });
    const files = await this.filesService.findByFolder(folder.id);
    for (const file of files) {
      await this.filesService.doubleFile(cloudName, file, newFolder.id);
    }
    const children = await this.findChildren(folder.id);
    for (const child of children) {
      await this.doubleFolder(cloudName, child, newFolder.id);
    }
    return newFolder;
  }
}

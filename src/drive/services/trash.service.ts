import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../global-services/prisma.service';
import { FoldersService } from './folders.service';
import { FilesService } from './files.service';
import { File, Folder } from '@prisma/client';
import { InnersDto } from '../dto/inners.dto';

@Injectable()
export class TrashService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;

  @Inject(forwardRef(() => FilesService))
  private readonly filesService: FilesService;

  private async getOne(targetId: number, dir = false) {
    return this.prisma.trash.findFirst({
      where: {
        fileId: dir ? null : targetId,
        folderId: dir ? targetId : null,
        dir,
      },
    });
  }
  private async getElements(dir = false) {
    return this.prisma.trash.findMany({
      where: { dir },
      select: {
        Folder: dir,
        File: !dir,
      },
    });
  }
  private async record(targetId: number, parentId, dir = false) {
    return this.prisma.trash.create({
      data: {
        dir,
        parentId,
        fileId: dir ? null : targetId,
        folderId: dir ? targetId : null,
      },
    });
  }
  private async removeById(id: number) {
    return this.prisma.trash.delete({
      where: {
        id,
      },
    });
  }

  async trashFolder(folder: Folder) {
    await this.record(folder.id, folder.parentId, true);
    folder.trashed = true;
    folder.parentId = null;
    return this.foldersService.update(folder);
  }

  async unTrashFolder(folderId: number) {
    const folder = await this.foldersService.findOne(folderId, true);
    if (!folder.trashed) {
      return folder;
    }
    const trashRecord = await this.getOne(folder.id, true);
    try {
      const parent = await this.foldersService.findOne(trashRecord.parentId);
      folder.parentId = parent.id;
    } catch (e) {
      folder.parentId = null;
    }
    folder.trashed = false;
    await this.removeById(trashRecord.id);
    return this.foldersService.update(folder);
  }

  async trashFile(file: File) {
    await this.record(file.id, file.folderId);
    file.trashed = true;
    file.folderId = null;
    return this.filesService.update(file);
  }

  async unTrashFile(fileId: number) {
    const file = await this.filesService.findOne(fileId, true);
    if (!file.trashed) {
      return file;
    }
    const trashRecord = await this.getOne(file.id);
    try {
      const parent = await this.filesService.findOne(trashRecord.parentId);
      file.folderId = parent.id;
    } catch (e) {
      file.folderId = null;
    }
    file.trashed = false;
    await this.removeById(trashRecord.id);
    return this.filesService.update(file);
  }

  async getAll(): Promise<InnersDto> {
    const folderRecords = await this.getElements(true);
    const fileRecords = await this.getElements();
    const folders = folderRecords.map((f) => f.Folder);
    const files = fileRecords.map((f) => f.File);
    return {
      folders,
      files,
    };
  }
}

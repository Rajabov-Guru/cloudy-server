import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../global-services/prisma.service';
import { FoldersService } from './folders.service';
import { FilesService } from './files.service';
import { File, Folder } from '@prisma/client';
import { InnersDto } from '../dto/inners.dto';
import { TrashDto } from '../dto/trash.dto';

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
  private async getElements(cloudId: number, dir = false) {
    return this.prisma.trash.findMany({
      where: {
        cloudId,
        dir,
      },
      select: {
        Folder: dir,
        File: !dir,
      },
    });
  }
  private async record(dto: TrashDto) {
    return this.prisma.trash.create({
      data: {
        cloudId: dto.cloudId,
        dir: dto.dir,
        parentId: dto.parentId,
        fileId: dto.dir ? null : dto.targetId,
        folderId: dto.dir ? dto.targetId : null,
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
    const dto = new TrashDto(folder, true);
    await this.record(dto);
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
    const dto = new TrashDto(file, true);
    await this.record(dto);
    file.trashed = true;
    file.parentId = null;
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
      file.parentId = parent.id;
    } catch (e) {
      file.parentId = null;
    }
    file.trashed = false;
    await this.removeById(trashRecord.id);
    return this.filesService.update(file);
  }

  async getAll(cloudId: number): Promise<InnersDto> {
    const folderRecords = await this.getElements(cloudId, true);
    const fileRecords = await this.getElements(cloudId);
    const folders = folderRecords.map((f) => f.Folder);
    const files = fileRecords.map((f) => f.File);
    return {
      folders,
      files,
    };
  }
}

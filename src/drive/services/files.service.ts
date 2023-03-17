import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as pathManager from 'path';
import { PrismaService } from '../../global-services/prisma.service';
import { FsService } from '../../global-services/fs.service';
import { FoldersService } from './folders.service';
import { FilesException } from '../../exceptions/files.exception';
import { LoadFilesDto } from '../dto/load-files.dto';
import { File } from '@prisma/client';
import { RenameDto } from '../dto/rename.dto';
import { TrashService } from './trash.service';
import { StatisticsService } from '../../statistics/statistics.service';

@Injectable()
export class FilesService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;

  @Inject(FsService)
  private readonly fsService: FsService;

  @Inject(TrashService)
  private readonly trashService: TrashService;

  @Inject(forwardRef(() => StatisticsService))
  private readonly statisticsService: StatisticsService;

  async findOne(fileId: number, trashed = false) {
    const folder = await this.prisma.file.findFirst({
      where: { id: fileId, trashed },
    });
    if (!folder) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return folder;
  }

  async findByFolder(folderId: number, trashed = false) {
    return this.prisma.file.findMany({
      where: { folderId, trashed },
    });
  }

  async getRootFiles() {
    return this.prisma.file.findMany({
      where: {
        folderId: null,
        trashed: false,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async saveFiles(
    dto: LoadFilesDto,
    files: Array<Express.Multer.File>,
    cloudName: string,
  ) {
    const fileItems: File[] = [];
    let size = 0;
    for (const file of files) {
      const saved = await this.saveSingleFile(dto.parentId, file, cloudName);
      fileItems.push(saved);
      size += file.size;
    }
    await this.statisticsService.changeUsedAmount(cloudName, size);
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

  async renameFile(cloudName: string, dto: RenameDto) {
    const file = await this.findOne(dto.targetId);
    if (file.freezed) return file;
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
    let file = await this.prisma.file.findFirst({
      where: { id: fileId },
    });
    if (file.freezed) return file;
    if (file.pined) {
      file = await this.pin(file.id);
    }
    if (!file.trashed) {
      return this.trashService.trashFile(file);
    }
    file = await this.trashService.unTrashFile(file.id);
    await this.fsService.delete(cloudName, file.pathName);
    file = await this.prisma.file.delete({
      where: { id: fileId },
    });
    await this.statisticsService.changeUsedAmount(cloudName, -file.size);
    return file;
  }

  async deleteAllByFolder(cloudName: string, folderId: number) {
    const files = await this.prisma.file.findMany({
      where: {
        folderId,
      },
    });
    let size = 0;
    for (const file of files) {
      await this.fsService.delete(cloudName, file.pathName);
      size += file.size;
    }
    await this.statisticsService.changeUsedAmount(cloudName, -size);
  }

  async doubleFile(cloudName: string, file: File, folderId: number) {
    const newPathName = await this.fsService.copy(cloudName, file, folderId);
    const newFile = await this.prisma.file.create({
      data: {
        name: file.name,
        pathName: newPathName,
        extension: file.extension,
        size: file.size,
        folderId,
      },
    });
    await this.statisticsService.changeUsedAmount(cloudName, newFile.size);
    return file;
  }

  async replace(cloudName: string, fileId: number, newFolderId: number) {
    const file = await this.findOne(fileId);
    if (file.freezed) return file;
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
    if (file.freezed) return file;
    return this.doubleFile(cloudName, file, folderId);
  }

  async favorites(fileId: number) {
    const file = await this.findOne(fileId);
    file.favorite = !file.favorite;
    return this.update(file);
  }

  async pin(fileId: number) {
    const file = await this.findOne(fileId);
    file.pined = !file.pined;
    return this.update(file);
  }

  async freeze(fileId: number) {
    const file = await this.findOne(fileId);
    file.freezed = !file.freezed;
    return this.update(file);
  }

  async getManyByIds(ids: number[]) {
    return this.prisma.file.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async getSumSizeByExt(cloudId: number, exts: string[]) {
    const result = await this.prisma.file.aggregate({
      _sum: {
        size: true,
      },
      where: {
        Folder: {
          cloudId,
        },
        extension: {
          in: exts,
        },
      },
    });
    return result._sum.size;
  }
}

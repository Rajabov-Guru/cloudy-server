import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as pathManager from 'path';
import { PrismaService } from '../../global-services/prisma.service';
import { FsService } from '../../global-services/fs.service';
import { FoldersService } from './folders.service';
import { FilesException } from '../../exceptions/files.exception';
import { LoadFilesDto } from '../dto/load-files.dto';
import { Cloud, File, Folder, SharedList } from '@prisma/client';
import { TrashService } from './trash.service';
import { StatisticsService } from '../../statistics/statistics.service';
import { CloudsService } from '../../clouds/clouds.service';
import { SharingService } from './sharing.service';
import { ShareDto } from '../dto/share.dto';

@Injectable()
export class FilesService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;

  @Inject(forwardRef(() => CloudsService))
  private readonly cloudsService: CloudsService;

  @Inject(FsService)
  private readonly fsService: FsService;

  @Inject(TrashService)
  private readonly trashService: TrashService;

  @Inject(forwardRef(() => StatisticsService))
  private readonly statisticsService: StatisticsService;

  @Inject(SharingService)
  private readonly sharingService: SharingService;

  async findOne(targetData: number | string, trashed = false) {
    let file: File;
    if (typeof targetData === 'number') {
      file = await this.prisma.file.findFirst({
        where: { id: targetData, trashed },
      });
    } else {
      file = await this.prisma.file.findFirst({
        where: { pathName: targetData, trashed },
      });
    }
    if (!file) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return file;
  }

  async isStorageFull(cloudId: number, size: number) {
    const stat = await this.statisticsService.getByCloud(cloudId);
    return size + stat.usedAmount > stat.storeAmount;
  }

  async checkExisting(fileName: string, parentId: number) {
    const candidate = await this.prisma.file.findFirst({
      where: {
        name: fileName,
        parentId,
      },
    });
    if (candidate) {
      throw new FilesException('ALREADY_EXISTS');
    }
  }

  async getFileCloud(fileId: number) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
      },
      select: {
        Cloud: true,
      },
    });
    return file.Cloud;
  }

  async findByFolder(parentId: number, trashed = false) {
    return this.prisma.file.findMany({
      where: { parentId, trashed },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async findBySharedFolder(parentId: number) {
    return this.prisma.file.findMany({
      where: {
        parentId,
        trashed: false,
        shared: true,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async getRootFiles(cloudId: number) {
    return this.prisma.file.findMany({
      where: {
        parentId: null,
        trashed: false,
        cloudId,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async saveFiles(
    dto: LoadFilesDto,
    files: Array<Express.Multer.File>,
    cloud: Cloud,
  ) {
    const fileItems: File[] = [];
    let size = 0;
    for (const file of files) {
      const saved = await this.saveSingleFile(dto.parentId, file, cloud);
      fileItems.push(saved);
      size += file.size;
    }
    await this.statisticsService.changeUsedAmount(cloud.name, size);
    return fileItems;
  }

  async saveSingleFile(
    parentId: number | null,
    file: Express.Multer.File,
    cloud: Cloud,
  ) {
    const filename = file.originalname;
    await this.checkExisting(filename, parentId);
    const ext = pathManager.extname(filename);
    const pathName = await this.fsService.save(cloud.name, file, parentId);
    const saved = await this.prisma.file.create({
      data: {
        name: filename,
        pathName,
        extension: ext,
        size: file.size,
        parentId,
        cloudId: cloud.id,
      },
    });
    return saved;
  }

  async rename(cloudName: string, id: number, name: string) {
    const file = await this.findOne(id);
    await this.checkExisting(name, file.parentId);
    const newName = `${name}${file.extension}`;
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

  async deleteAllByFolder(cloudName: string, parentId: number) {
    const files = await this.prisma.file.findMany({
      where: {
        parentId,
      },
    });
    let size = 0;
    for (const file of files) {
      await this.fsService.delete(cloudName, file.pathName);
      size += file.size;
    }
    await this.statisticsService.changeUsedAmount(cloudName, -size);
  }

  async doubleFile(cloud: Cloud, file: File, parentId: number) {
    file.name = `${file.name}_(copy)`;
    const newPathName = await this.fsService.copy(cloud.name, file, parentId);
    const newFile = await this.prisma.file.create({
      data: {
        name: file.name,
        pathName: newPathName,
        extension: file.extension,
        size: file.size,
        parentId,
        cloudId: cloud.id,
      },
    });
    await this.statisticsService.changeUsedAmount(cloud.name, newFile.size);
    return file;
  }

  async replace(cloudName: string, fileId: number, newFolderId: number) {
    const file = await this.findOne(fileId);
    await this.checkExisting(file.name, file.parentId);
    const newPathName = await this.fsService.replace(
      cloudName,
      file,
      newFolderId,
    );
    file.parentId = newFolderId;
    file.pathName = newPathName;
    return this.update(file);
  }

  async copy(cloud: Cloud, fileId: number, folderId: number) {
    const file = await this.findOne(fileId);
    file.name = `${file.name}_(copy)`;
    return this.doubleFile(cloud, file, folderId);
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
        cloudId,
        extension: {
          in: exts,
        },
      },
    });
    return result._sum.size;
  }

  async shareFile(target: number | File, dto: ShareDto) {
    let file: File;
    if (typeof target === 'number') {
      file = await this.findOne(target);
    } else {
      file = target;
    }
    let shared = await this.sharingService.findOne(file.id);
    if (shared) {
      shared.AccessAction = dto.accessMode;
      shared.open = dto.open;
      shared = await this.sharingService.update(shared);
    } else shared = await this.sharingService.share(file.id, dto);
    file.shared = dto.open;
    file = await this.update(file);
    return shared;
  }

  async shareFilesByFolder(folderId: number, dto: ShareDto) {
    const files = await this.findByFolder(folderId);
    const savedSharings: SharedList[] = [];
    for (const file of files) {
      const fileDto = new ShareDto();
      fileDto.accessMode = dto.accessMode;
      fileDto.open = dto.open;
      const saved = await this.shareFile(file, dto);
      savedSharings.push(saved);
    }
    return savedSharings;
  }
}

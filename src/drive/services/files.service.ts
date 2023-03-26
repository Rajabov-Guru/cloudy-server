import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as pathManager from 'path';
import { PrismaService } from '../../global-services/prisma.service';
import { FsService } from '../../global-services/fs.service';
import { FoldersService } from './folders.service';
import { FilesException } from '../../exceptions/files.exception';
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
        where: {
          id: targetData,
          OR: [{ trashed }, { trashed: trashed ? !trashed : trashed }],
        },
      });
    } else {
      file = await this.prisma.file.findFirst({
        where: {
          pathName: targetData,
          OR: [{ trashed }, { trashed: trashed ? !trashed : trashed }],
        },
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

  async findByFolder(parentId: number, trashed = false) {
    return this.prisma.file.findMany({
      where: { parentId, trashed },
      orderBy: {
        pined: 'desc',
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
        pined: 'desc',
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
        pined: 'desc',
      },
    });
  }

  async saveFiles(
    parentId: number | null,
    files: Array<Express.Multer.File>,
    cloud: Cloud,
  ) {
    const sumSize = files.reduce((sum, f) => f.size + sum, 0);
    const isFull = await this.isStorageFull(cloud.id, sumSize);
    if (isFull) {
      throw new FilesException('NOT ENOUGH SPACE');
    }
    if (parentId) {
      const parent = await this.foldersService.findOne(parentId);
      cloud = await this.cloudsService.findOne(parent.cloudId);
    }
    const fileItems: File[] = [];
    let size = 0;
    for (const file of files) {
      const saved = await this.saveSingleFile(parentId, file, cloud);
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
    const ext = pathManager.extname(file.originalname);
    const filename = file.originalname.replace(ext, '');
    await this.checkExisting(filename, parentId);
    const pathName = await this.fsService.save(cloud.name, file);
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

  async rename(id: number, name: string) {
    const file = await this.findOne(id);
    await this.checkExisting(name, file.parentId);
    file.name = name;
    return this.update(file);
  }

  async update(data: File) {
    return this.prisma.file.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(fileId: number) {
    let file = await this.findOne(fileId, true);
    const cloud = await this.cloudsService.findOne(file.cloudId);
    if (file.pined) {
      file = await this.pin(file.id);
    }
    if (!file.trashed) {
      return this.trashService.trashFile(file);
    }
    file = await this.trashService.unTrashFile(file.id);
    const pathName = `${file.pathName}${file.extension}`;
    await this.fsService.delete(cloud.name, pathName);
    file = await this.prisma.file.delete({
      where: { id: fileId },
    });
    await this.statisticsService.changeUsedAmount(cloud.name, -file.size);
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
      const pathName = `${file.pathName}${file.extension}`;
      await this.fsService.delete(cloudName, pathName);
      size += file.size;
    }
    await this.statisticsService.changeUsedAmount(cloudName, -size);
  }

  async replace(fileId: number, parentId: number) {
    const file = await this.findOne(fileId);
    const parent = await this.foldersService.findOne(parentId);
    if (file.cloudId !== parent.cloudId) {
      throw new FilesException('NOT ALLOWED');
    }
    await this.checkExisting(file.name, parentId);
    file.parentId = parentId;
    return this.update(file);
  }

  async doubleFile(file: File, parent: Folder) {
    const fileCloud = await this.cloudsService.findOne(file.cloudId);
    const parentCloud = await this.cloudsService.findOne(parent.cloudId);
    const newPathName = await this.fsService.copy(
      fileCloud.name,
      parentCloud.name,
      file,
    );
    const newFile = await this.prisma.file.create({
      data: {
        name: file.name,
        pathName: newPathName,
        extension: file.extension,
        size: file.size,
        parentId: parent.id,
        cloudId: parent.cloudId,
      },
    });
    await this.statisticsService.changeUsedAmount(
      parentCloud.name,
      newFile.size,
    );
    return newFile;
  }

  async copy(fileId: number, parentId: number) {
    const file = await this.findOne(fileId);
    const parent = await this.foldersService.findOne(parentId);
    if (file.parentId === parentId) file.name = `${file.name}_(copy)`;
    await this.checkExisting(file.name, parentId);
    return this.doubleFile(file, parent);
  }

  async favorites(fileId: number) {
    const file = await this.findOne(fileId);
    file.favorite = !file.favorite;
    return this.update(file);
  }

  async getFavorites(cloudId: number) {
    return this.prisma.file.findMany({
      where: {
        cloudId,
        favorite: true,
      },
    });
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

  async getFrozen(cloudId: number) {
    return this.prisma.file.findMany({
      where: {
        cloudId,
        freezed: true,
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
    console.log(dto);
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
      fileDto.dir = false;
      const saved = await this.shareFile(file, fileDto);
      savedSharings.push(saved);
    }
    return savedSharings;
  }

  async streamFilePath(path: string) {
    const foundedFile = await this.findOne(path);
    const cloud = await this.cloudsService.findOne(foundedFile.cloudId);
    const filePath = `${foundedFile.pathName}${foundedFile.extension}`;
    foundedFile.pathName = await this.fsService.getFilePath(
      cloud.name,
      filePath,
    );
    return foundedFile;
  }
}

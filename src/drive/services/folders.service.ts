import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cloud, Folder } from '@prisma/client';
import { PrismaService } from '../../global-services/prisma.service';
import { FsService } from '../../global-services/fs.service';
import { CloudsService } from '../../clouds/clouds.service';
import { FilesService } from './files.service';
import { FilesException } from '../../exceptions/files.exception';
import { InnersDto } from '../dto/inners.dto';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { TrashService } from './trash.service';
import { SharingService } from './sharing.service';
import { ShareDto } from '../dto/share.dto';
import { v4 as uuidv4 } from 'uuid';

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

  @Inject(TrashService)
  private readonly trashService: TrashService;

  @Inject(SharingService)
  private readonly sharingService: SharingService;

  private async doubleFolder(cloud: Cloud, folder: Folder, parentId: number) {
    const data = folder;
    data.parentId = parentId;
    const pathName = uuidv4();
    const newFolder = await this.prisma.folder.create({
      data: {
        name: data.name,
        cloudId: data.cloudId,
        parentId: data.parentId,
        pathName,
      },
    });
    const files = await this.filesService.findByFolder(folder.id);
    for (const file of files) {
      await this.filesService.doubleFile(cloud, file, newFolder.id);
    }
    const children = await this.findChildren(folder.id);
    for (const child of children) {
      await this.doubleFolder(cloud, child, newFolder.id);
    }
    return newFolder;
  }

  async findOne(targetData: number | string, trashed = false) {
    let folder: Folder;
    if (typeof targetData === 'number') {
      folder = await this.prisma.folder.findFirst({
        where: { id: targetData, trashed },
      });
    } else {
      folder = await this.prisma.folder.findFirst({
        where: { pathName: targetData, trashed },
      });
    }
    if (!folder) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return folder;
  }

  async checkExisting(folderName: string, parentId: number) {
    const candidate = await this.prisma.folder.findFirst({
      where: {
        name: folderName,
        parentId,
      },
    });
    if (candidate) {
      throw new FilesException('ALREADY_EXISTS');
    }
  }

  async findChildren(folderId: number, trashed = false) {
    return this.prisma.folder.findMany({
      where: {
        parentId: folderId,
        trashed,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async findSharedChildren(folderId: number) {
    return this.prisma.folder.findMany({
      where: {
        parentId: folderId,
        trashed: false,
        shared: true,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async getRootFolders(cloudId: number) {
    return this.prisma.folder.findMany({
      where: {
        cloudId,
        parentId: null,
        trashed: false,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async getRoot(cloudId: number): Promise<InnersDto> {
    const folders = await this.getRootFolders(cloudId);
    const files = await this.filesService.getRootFiles(cloudId);
    const result = new InnersDto(folders, files);
    return result;
  }

  async getSharedFolderInners(folderId: number): Promise<InnersDto> {
    const accessMode = await this.sharingService.checkSharing(folderId, true);
    const folders = await this.findSharedChildren(folderId);
    const files = await this.filesService.findBySharedFolder(folderId);
    const result = new InnersDto(folders, files, accessMode);
    return result;
  }

  async getFolderInners(cloudId: number, pathName: string): Promise<InnersDto> {
    const folder = await this.findOne(pathName);
    const accessMode = null;
    if (folder.cloudId !== cloudId && folder.shared) {
      return this.getSharedFolderInners(folder.id);
    }
    const folders = await this.findChildren(folder.id);
    const files = await this.filesService.findByFolder(folder.id);
    const result = new InnersDto(folders, files, accessMode);
    return result;
  }

  async update(data: Folder) {
    return this.prisma.folder.update({
      where: { id: data.id },
      data,
    });
  }

  async create(dto: CreateFolderDto, cloudId: number) {
    await this.checkExisting(dto.name, dto.parentId);
    const pathName = uuidv4();
    const folder = await this.prisma.folder.create({
      data: {
        name: dto.name,
        cloudId: cloudId,
        parentId: dto.parentId,
        pathName,
      },
    });
    return folder;
  }

  async rename(id: number, newName: string) {
    const folder = await this.findOne(id);
    if (folder.freezed) return folder;
    await this.checkExisting(newName, folder.parentId);
    folder.name = newName;
    return this.update(folder);
  }

  async delete(folderId: number) {
    let folder = await this.prisma.folder.findFirst({
      where: { id: folderId },
    });
    if (folder.freezed) return folder;
    if (folder.pined) {
      folder = await this.pin(folder.id);
    }
    if (!folder.trashed) {
      return this.trashService.trashFolder(folder);
    }
    folder = await this.trashService.unTrashFolder(folder.id);
    const cloud = await this.cloudsService.findOne(folder.cloudId);
    await this.deleteFilesRec(cloud.name, folderId);
    return this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  private async deleteFilesRec(cloudName: string, folderId: number) {
    await this.filesService.deleteAllByFolder(cloudName, folderId);
    const subFolders = await this.findChildren(folderId);
    for (const subFolder of subFolders) {
      await this.deleteFilesRec(cloudName, subFolder.id);
    }
  }

  async replace(folderId: number, newParentId: number) {
    const folder = await this.findOne(folderId);
    if (folder.freezed) return folder;
    await this.checkExisting(folder.name, newParentId);
    folder.parentId = newParentId;
    return this.update(folder);
  }

  async copy(cloud: Cloud, id: number, parentId: number) {
    const folder = await this.findOne(id);
    if (folder.freezed) return folder;
    await this.checkExisting(folder.name, parentId);
    return this.doubleFolder(cloud, folder, parentId);
  }

  async favorites(folderId: number) {
    const folder = await this.findOne(folderId);
    folder.favorite = !folder.favorite;
    return this.update(folder);
  }

  async pin(folderId: number) {
    const folder = await this.findOne(folderId);
    folder.pined = !folder.pined;
    return this.update(folder);
  }

  async freeze(folderId: number) {
    const folder = await this.findOne(folderId);
    folder.freezed = !folder.freezed;
    return this.update(folder);
  }

  async shareFolder(folderId: number, dto: ShareDto) {
    const folder = await this.findOne(folderId);
    let shared = await this.sharingService.findOne(folder.id, true);
    if (shared) {
      shared.AccessAction = dto.accessMode;
      shared.open = dto.open;
      shared = await this.sharingService.update(shared);
    } else shared = await this.sharingService.share(folderId, dto);
    await this.filesService.shareFilesByFolder(folderId, dto);
    const children = await this.findChildren(folderId);
    for (const child of children) {
      const childDto = new ShareDto(true);
      childDto.accessMode = dto.accessMode;
      childDto.open = dto.open;
      await this.shareFolder(child.id, childDto);
    }
    folder.shared = dto.open;
    return this.update(folder);
  }

  async getManyByIds(ids: number[]) {
    return this.prisma.folder.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}

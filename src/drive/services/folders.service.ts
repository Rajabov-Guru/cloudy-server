import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Folder } from '@prisma/client';
import { PrismaService } from '../../global-services/prisma.service';
import { FsService } from '../../global-services/fs.service';
import { CloudsService } from '../../clouds/clouds.service';
import { FilesService } from './files.service';
import { FilesException } from '../../exceptions/files.exception';
import { InnersDto } from '../dto/inners.dto';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { RenameDto } from '../dto/rename.dto';
import { CopyDto } from '../dto/copy.dto';
import { TrashService } from './trash.service';

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

  async findOne(folderId: number, trashed = false) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: folderId,
        trashed,
      },
    });
    if (!folder) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return folder;
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

  async getRootFolders() {
    return this.prisma.folder.findMany({
      where: {
        parentId: null,
        trashed: false,
      },
      orderBy: {
        pined: 'asc',
      },
    });
  }

  async getRoot(): Promise<InnersDto> {
    const folders = await this.getRootFolders();
    const files = await this.filesService.getRootFiles();
    return {
      folders,
      files,
    };
  }

  async getFolderInners(folderId: number): Promise<InnersDto> {
    const folders = await this.findChildren(folderId);
    const files = await this.filesService.findByFolder(folderId);
    return {
      folders,
      files,
    };
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

  async rename(dto: RenameDto) {
    const folder = await this.findOne(dto.targetId);
    if (folder.freezed) return folder;
    folder.name = dto.newName;
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
    folder.parentId = newParentId;
    return this.update(folder);
  }

  async copy(cloudName: string, dto: CopyDto) {
    const folder = await this.findOne(dto.targetId);
    if (folder.freezed) return folder;
    return this.doubleFolder(cloudName, folder, dto.parentId);
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

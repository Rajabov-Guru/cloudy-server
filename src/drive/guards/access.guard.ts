import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Cloud, Folder, File } from '@prisma/client';
import { FilesException } from '../../exceptions/files.exception';
import { FoldersService } from '../services/folders.service';
import { IS_FOLDER_KEY } from '../../decorators/is-folder-endpoint.decorator';
import { Reflector } from '@nestjs/core';
import { FilesService } from '../services/files.service';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private foldersService: FoldersService,
    private filesService: FilesService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const isFolder = this.reflector.get<boolean>(
      IS_FOLDER_KEY,
      context.getClass(),
    );
    const params = req.params;
    const pathName = params.path;
    const id = params.id;
    const currentCloud = req.cloud as Cloud;
    let folder: Folder;
    let file: File;
    if (isFolder) {
      folder = await this.foldersService.findOne(id ? id : pathName);
    } else {
      file = await this.filesService.findOne(id ? id : pathName);
    }
    const fileCondition = file.cloudId === currentCloud.id || file.shared;
    const folderCondition = folder.cloudId === currentCloud.id || folder.shared;
    const finalCondition = isFolder ? folderCondition : fileCondition;
    if (finalCondition) {
      return true;
    }
    throw new FilesException('ACCESS DENIED');
  }
}

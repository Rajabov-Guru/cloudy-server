import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Cloud, Folder, File, AccessAction } from '@prisma/client';
import { FilesException } from '../../exceptions/files.exception';
import { FoldersService } from '../services/folders.service';
import { IS_FOLDER_KEY } from '../../decorators/is-folder-endpoint.decorator';
import { Reflector } from '@nestjs/core';
import { FilesService } from '../services/files.service';
import { ACCESS_MODE } from '../../decorators/access-mode.decorator';
import { SharingService } from '../services/sharing.service';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    protected foldersService: FoldersService,
    protected filesService: FilesService,
    protected sharingService: SharingService,
    protected reflector: Reflector,
  ) {}

  async checkTargetAccess(
    context: ExecutionContext,
    cloud: Cloud,
    targetData: number | string,
    dir: boolean,
  ) {
    console.log('access guard');
    const isFolder = dir;
    const accessMode = this.reflector.get<AccessAction | null>(
      ACCESS_MODE,
      context.getHandler(),
    );
    console.log(isFolder, accessMode);
    let target: Folder | File;
    if (dir) {
      console.log('here');
      target = await this.foldersService.findOne(targetData, true);
    } else {
      target = await this.filesService.findOne(targetData, true);
    }
    let result = false;
    if (target.cloudId === cloud.id) result = true;
    else if (target.shared) {
      const shared = await this.sharingService.findOne(target.id, isFolder);
      const cond1 = !shared.open || accessMode === null;
      const cond2 =
        accessMode === AccessAction.EDIT &&
        shared.AccessAction !== AccessAction.EDIT;
      result = !(cond1 || cond2);
    }
    return result;
  }
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
    const result = await this.checkTargetAccess(
      context,
      currentCloud,
      id ? +id : pathName,
      isFolder,
    );
    if (result) {
      return true;
    }
    throw new FilesException('ACCESS DENIED');
  }
}

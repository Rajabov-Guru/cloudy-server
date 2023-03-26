import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccessGuard } from './access.guard';
import { Cloud } from '@prisma/client';
import { FilesException } from '../../exceptions/files.exception';
import { FoldersService } from '../services/folders.service';
import { FilesService } from '../services/files.service';
import { SharingService } from '../services/sharing.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CreateFolderGuard extends AccessGuard implements CanActivate {
  constructor(
    protected foldersService: FoldersService,
    protected filesService: FilesService,
    protected sharingService: SharingService,
    protected reflector: Reflector,
  ) {
    super(foldersService, filesService, sharingService, reflector);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const currentCloud = req.cloud as Cloud;
    const { parentId } = req.body;
    const access = await this.checkTargetAccess(
      context,
      currentCloud,
      parentId,
      true,
    );
    if (access) return true;
    throw new FilesException('NOT ALLOWED');
  }
}

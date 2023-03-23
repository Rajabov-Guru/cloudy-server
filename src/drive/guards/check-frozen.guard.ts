import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FilesService } from '../services/files.service';
import { FoldersService } from '../services/folders.service';
import { Reflector } from '@nestjs/core';
import { IS_FOLDER_KEY } from '../../decorators/is-folder-endpoint.decorator';

@Injectable()
export class CheckFrozenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private filesService: FilesService,
    private folderService: FoldersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const params = req.params;
    const id = Number(params.id);
    if (id === undefined || isNaN(id) || id === null) {
      return true;
    }
    const isFolder = this.reflector.get<boolean>(
      IS_FOLDER_KEY,
      context.getClass(),
    );
    if (!isFolder) {
      const target = await this.filesService.findOne(id);
      return !target.freezed;
    } else {
      const target = await this.folderService.findOne(id);
      return !target.freezed;
    }
  }
}

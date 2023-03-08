import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as pathManager from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { Repository } from 'typeorm';
import { FolderException } from '../exceptions/folder.exception';

@Injectable()
export class FoldersService {
  @InjectRepository(Folder)
  private readonly folderRepository: Repository<Folder>;

  getFolderPath(parent: Folder | null = null): string {
    const rootPath = pathManager.resolve(__dirname, '..', 'static');
    const parentPath = `${parent ? parent.path : ''}`;
    return pathManager.resolve(rootPath, parentPath);
  }

  async findOne(folderId: number) {
    const folder = await this.folderRepository.findOneBy({ id: folderId });
    if (!folder) {
      throw new FolderException('DOESNT_EXISTS');
    }
    return folder;
  }

  async createFolder(name: string, userId: number, parentId?: number) {
    const parent = await this.findOne(parentId);
    const folderPath = this.getFolderPath(parent);
    if (fs.existsSync(folderPath)) {
      throw new FolderException('ALREADY_EXISTS');
    }
    fs.mkdirSync(folderPath, { recursive: true });
    let folder = new Folder();
    folder.userId = userId;
    folder.name = name;
    folder.path = folderPath;
    folder = await this.folderRepository.save(folder);
    return folder;
  }
}

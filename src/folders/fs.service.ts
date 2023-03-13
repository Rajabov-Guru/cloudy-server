import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as pathManager from 'path';
import { FoldersService } from './folders.service';
import * as fs from 'fs';
import { FilesException } from '../exceptions/files.exception';

@Injectable()
export class FsService {
  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;
  getRootPath() {
    return pathManager.resolve(__dirname, '..', 'static');
  }
  resolveFullPath(path: string) {
    const root = this.getRootPath();
    return pathManager.resolve(root, path);
  }

  makeDirectory(relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    if (fs.existsSync(fullPath)) {
      throw new FilesException('ALREADY_EXISTS');
    }
    fs.mkdirSync(fullPath, { recursive: true });
  }
  delete(relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Произошла ошибка при удалении файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  save(file: Express.Multer.File, relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    if (fs.existsSync(fullPath)) {
      throw new FilesException('ALREADY_EXISTS');
    }
    fs.writeFileSync(fullPath, file.buffer);
  }
}

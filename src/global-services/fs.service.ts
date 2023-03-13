import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as pathManager from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { FilesException } from '../exceptions/files.exception';

@Injectable()
export class FsService {
  getRootPath() {
    return pathManager.resolve(__dirname, '..', 'static');
  }
  resolveFullPath(path: string) {
    const root = this.getRootPath();
    return pathManager.resolve(root, path);
  }
  async makeDirectory(relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    const exists = await fse.exists(fullPath);
    if (exists) {
      throw new FilesException('ALREADY_EXISTS');
    }
    await fse.mkdir(fullPath, { recursive: true });
    // if (fs.existsSync(fullPath)) {
    //   throw new FilesException('ALREADY_EXISTS');
    // }
    // fs.mkdirSync(fullPath, { recursive: true });
  }
  async delete(relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    try {
      await fse.rmdir(fullPath);
      // fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Произошла ошибка при удалении файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async save(file: Express.Multer.File, relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    const exists = await fse.exists(fullPath);
    if (exists) {
      throw new FilesException('ALREADY_EXISTS');
    }
    await fse.writeFile(fullPath, file.buffer);
    // if (fs.existsSync(fullPath)) {
    //   throw new FilesException('ALREADY_EXISTS');
    // }
    // fs.writeFileSync(fullPath, file.buffer);
  }
  async makeEmpty(relativePath: string) {
    const fullPath = this.resolveFullPath(relativePath);
    try {
      await fse.emptyDir(fullPath);
    } catch (e) {
      throw e;
    }
    // fs.readdir(fullPath, (err, files) => {
    //   if (err) throw err;
    //
    //   for (const file of files) {
    //     fs.unlinkSync(`${fullPath}/${file}`);
    //   }
    // });
  }
  async replace(from: string, to: string) {
    from = this.resolveFullPath(from);
    to = this.resolveFullPath(to);
    await fse.move(from, to);
  }
  async copy(from: string, to: string) {
    from = this.resolveFullPath(from);
    to = this.resolveFullPath(to);
    await fse.copy(from, to);
  }
}

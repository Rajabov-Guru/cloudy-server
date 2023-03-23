import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as pathManager from 'path';
import * as fse from 'fs-extra';
import { FilesException } from '../exceptions/files.exception';
import { File } from '@prisma/client';

@Injectable()
export class FsService {
  private getRootPath() {
    return pathManager.resolve(__dirname, '..', 'static');
  }
  private getPathName(folderId: number | null, filename: string) {
    return `${folderId ? folderId : 0}-${filename}`;
  }
  private resolveFullPath(path: string) {
    const root = this.getRootPath();
    return pathManager.resolve(root, path);
  }

  async getFilePath(cloudName: string, pathName: string) {
    const relativePath = pathManager.join(cloudName, pathName);
    return this.resolveFullPath(relativePath);
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
  async delete(cloudName: string, pathName: string) {
    const filePath = await this.getFilePath(cloudName, pathName);
    try {
      await fse.rm(filePath);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Произошла ошибка при удалении файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async save(
    cloudName: string,
    file: Express.Multer.File,
    folderId: number | null,
  ) {
    const pathName = this.getPathName(folderId, file.originalname);
    const relativePath = pathManager.join(cloudName, pathName);
    const fullPath = this.resolveFullPath(relativePath);
    const exists = await fse.exists(fullPath);
    if (exists) {
      throw new FilesException('ALREADY_EXISTS');
    }
    await fse.writeFile(fullPath, file.buffer);
    return pathName;
    // if (fs.existsSync(fullPath)) {
    //   throw new FilesException('ALREADY_EXISTS');
    // }
    // fs.writeFileSync(fullPath, file.buffer);
  }
  async rename(cloudName: string, file: File, newName: string) {
    const newPathName = this.getPathName(file.parentId, newName);
    const oldRelPath = pathManager.join(cloudName, file.pathName);
    const newRelPath = pathManager.join(cloudName, newPathName);
    const oldPath = this.resolveFullPath(oldRelPath);
    const newPath = this.resolveFullPath(newRelPath);
    await fse.rename(oldPath, newPath);
    return newPathName;
  }
  async copy(cloudName: string, file: File, folderId: number | null) {
    const newPathName = this.getPathName(folderId, file.name);
    const fromPath = pathManager.join(cloudName, file.pathName);
    const toPath = pathManager.join(cloudName, newPathName);
    const from = this.resolveFullPath(fromPath);
    const to = this.resolveFullPath(toPath);
    await fse.copy(from, to);
    return newPathName;
  }
  async replace(cloudName: string, file: File, folderId: number | null) {
    const newPathName = this.getPathName(folderId, file.name);
    const oldRelPath = pathManager.join(cloudName, file.pathName);
    const newRelPath = pathManager.join(cloudName, newPathName);
    const oldPath = this.resolveFullPath(oldRelPath);
    const newPath = this.resolveFullPath(newRelPath);
    await fse.rename(oldPath, newPath);
    // await fs.rename(oldPath, newPath, (e) => {
    //   throw e;
    // });
    return newPathName;
  }
}

import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { PrismaService } from '../prisma.service';
import { CloudsService } from '../clouds/clouds.service';
import * as pathManager from 'path';
import { FilesException } from '../exceptions/files.exception';
import { File } from '@prisma/client';
import { CreateFileDto } from './dto/create-file.dto';
import { RenameFileDto } from './dto/rename-file.dto';
import { LoadFilesDto } from './dto/load-files.dto';

@Injectable()
export class FilesService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => CloudsService))
  private readonly cloudsService: CloudsService;

  getFilePath(
    cloudName: string,
    fileName: string,
    parent: File | null = null,
  ): string {
    const rootPath = this.getRootPath(cloudName);
    const parentPath = `${parent ? parent.path : ''}`;
    return pathManager.resolve(rootPath, parentPath, fileName);
  }

  getRootPath(cloudName: string) {
    return pathManager.resolve(__dirname, '..', 'static', cloudName);
  }

  async findOne(fileId: number) {
    const folder = await this.prisma.file.findFirst({
      where: { id: fileId },
    });
    if (!folder) {
      throw new FilesException('DOESNT_EXISTS');
    }
    return folder;
  }

  makeDirectory(path: string) {
    if (fs.existsSync(path)) {
      throw new FilesException('ALREADY_EXISTS');
    }
    fs.mkdirSync(path, { recursive: true });
  }

  async createDir(dto: CreateFileDto) {
    const cloud = await this.cloudsService.findOne(dto.cloudId);
    const pathName = dto.name;
    let parent = null;
    let path = pathName;
    if (dto.parentId) {
      parent = await this.findOne(dto.parentId);
      path = pathManager.join(parent.path, path);
    }
    const folderPath = this.getFilePath(cloud.name, pathName, parent);
    this.makeDirectory(folderPath);
    const file = await this.prisma.file.create({
      data: {
        name: dto.name,
        cloudId: dto.cloudId,
        parentId: dto.parentId,
        pathName,
        path,
        dir: true,
        extension: null,
      },
    });
    return file;
  }

  async saveFiles(dto: LoadFilesDto, files: Array<Express.Multer.File>) {
    const fileItems: File[] = [];
    for (const file of files) {
      const saved = await this.saveSingleFile(dto.parentId, file);
      fileItems.push(saved);
    }
    return fileItems;
  }

  async saveSingleFile(parentId: number, file: Express.Multer.File) {
    const parent = await this.findOne(parentId);
    const cloud = await this.cloudsService.findOne(parent.cloudId);
    if (!parent.dir) {
      throw new FilesException('NOT_DIR');
    }
    const filename = file.originalname;
    const ext = pathManager.extname(filename);
    const filePath = this.getFilePath(cloud.name, filename, parent);
    if (fs.existsSync(filePath)) {
      throw new FilesException('ALREADY_EXISTS');
    }
    fs.writeFileSync(filePath, file.buffer);
    const saved = await this.prisma.file.create({
      data: {
        name: filename,
        cloudId: cloud.id,
        parentId: parentId,
        pathName: filename,
        path: filePath,
        dir: false,
        extension: ext,
      },
    });
    return saved;
  }

  async loadFile(file: Express.Multer.File, path: string) {
    try {
      const fileName = uuid.v4() + pathManager.extname(file.originalname);
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      fs.writeFileSync(pathManager.join(path, fileName), file.buffer);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Произошла ошибка при записи файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFile(path: string): Promise<void> {
    try {
      await fs.unlink(pathManager.join(path), () => console.log('Deleted'));
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Произошла ошибка при удалении файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async renameFile(dto: RenameFileDto) {
    const file = await this.findOne(dto.fileId);
    // const oldPath = pathManager.resolve(file.path, file.name);
    // const newPath = pathManager.resolve(file.path, newName);
    // fs.rename(oldPath, newPath, (err) => {
    //   if (err) {
    //     throw err;
    //   }
    //   console.log('success folder renaming!');
    // });
    file.name = dto.newName;
    return this.update(file);
  }

  async update(data: File) {
    return this.prisma.file.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(fileId: number) {
    const file = await this.findOne(fileId);
    const cloud = await this.cloudsService.findOne(file.cloudId);
    const folderPath = this.getFilePath(cloud.name, file.path);
    fs.rmSync(folderPath, { recursive: true, force: true });
    return this.prisma.file.delete({
      where: { id: fileId },
    });
  }

  //reset folder (aka: make it empty)
  //replace folder
  //copy folder
}

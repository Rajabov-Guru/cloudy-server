import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  @InjectRepository(File)
  private readonly fileRepository: Repository<File>;

  async createFile(file): Promise<string> {
    try {
      const fileName = uuid.v4() + '.jpg';
      const filePath = path.resolve(__dirname, '..', 'static');
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(path.join(filePath, fileName), file.buffer);
      return fileName;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Произошла ошибка при записи файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(name): Promise<void> {
    try {
      const fileName = name;
      const filePath = path.resolve(__dirname, '..', 'static');
      await fs.unlink(path.join(filePath, fileName), () =>
        console.log('Deleted'),
      );
    } catch (e) {
      console.log(e);
      //throw new HttpException('Произошла ошибка при удалении файла', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

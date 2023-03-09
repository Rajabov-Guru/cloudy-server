import { HttpException, HttpStatus } from '@nestjs/common';

export type FolderExceptionType =
  | 'ALREADY_EXISTS'
  | 'DOESNT_EXISTS'
  | 'NOT_DIR';

const assertNever = (x: never): never => {
  throw new Error('Unexpected object: ' + x);
};

const getFolderExceptionLabel = (type: FolderExceptionType): string => {
  switch (type) {
    case 'ALREADY_EXISTS':
      return 'Папка или файл уже существует';
    case 'DOESNT_EXISTS':
      return 'Папки или файла не существует';
    case 'NOT_DIR':
      return 'Родительский файл не является папкой';
    default:
      return assertNever(type);
  }
};

export class FilesException extends HttpException {
  message: string;

  constructor(type: FolderExceptionType) {
    const response = getFolderExceptionLabel(type);
    super(response, HttpStatus.BAD_REQUEST);
    this.message = response;
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';

export type FolderExceptionType = 'ALREADY_EXISTS' | 'DOESNT_EXISTS';

const assertNever = (x: never): never => {
  throw new Error('Unexpected object: ' + x);
};

const getFolderExceptionLabel = (type: FolderExceptionType): string => {
  switch (type) {
    case 'ALREADY_EXISTS':
      return 'Папка уже существует';
    case 'DOESNT_EXISTS':
      return 'Папки не существует';
    default:
      return assertNever(type);
  }
};

export class FolderException extends HttpException {
  message: string;

  constructor(type: FolderExceptionType) {
    const response = getFolderExceptionLabel(type);
    super(response, HttpStatus.BAD_REQUEST);
    this.message = response;
  }
}

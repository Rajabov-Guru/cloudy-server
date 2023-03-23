import { AccessAction, File, Folder } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InnersDto {
  @ApiProperty({ description: 'Список папок' })
  folders: Folder[];

  @ApiProperty({ description: 'Список файлов' })
  files: File[];

  @ApiProperty({ description: 'Режим доступа' })
  accessMode?: AccessAction = AccessAction.EDIT;

  constructor(
    folders: Folder[],
    files: File[],
    accessMode?: AccessAction | null,
  ) {
    this.folders = folders;
    this.files = files;
    if (accessMode) this.accessMode = accessMode;
  }
}

import { File, Folder } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InnersDto {
  @ApiProperty({ description: 'Список папок' })
  folders: Folder[];

  @ApiProperty({ description: 'Список файлов' })
  files: File[];
}

import { ApiProperty } from '@nestjs/swagger';

export class RenameDto {
  @ApiProperty({ example: '2', description: 'id файла или папки' })
  targetId: number;

  @ApiProperty({ example: 'Фоточки', description: 'Новое имя' })
  newName: string;
}

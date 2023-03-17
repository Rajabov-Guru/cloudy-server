import { ApiProperty } from '@nestjs/swagger';

export class UnTrashDto {
  @ApiProperty({ example: '2', description: 'id файла или папки' })
  targetId: number;

  @ApiProperty({ example: 'true', description: 'файл или папка' })
  dir: boolean;
}

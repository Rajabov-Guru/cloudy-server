import { ApiProperty } from '@nestjs/swagger';

export class CopyDto {
  @ApiProperty({ example: '2', description: 'id файла или папки' })
  targetId: number;

  @ApiProperty({
    example: '2 (или null)',
    description: 'id родительской папки',
  })
  parentId: number | null;
}

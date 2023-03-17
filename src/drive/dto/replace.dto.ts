import { ApiProperty } from '@nestjs/swagger';

export class ReplaceDto {
  @ApiProperty({ example: '2', description: 'id файла или папки' })
  targetId: number;

  @ApiProperty({ example: '4', description: 'id нового родителя' })
  newParentId: number;
}

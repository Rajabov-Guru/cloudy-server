import { ApiProperty } from '@nestjs/swagger';

export class LoadFilesDto {
  @ApiProperty({
    example: '2 (или null)',
    description: 'id родительской папки',
  })
  parentId?: number | null;
}

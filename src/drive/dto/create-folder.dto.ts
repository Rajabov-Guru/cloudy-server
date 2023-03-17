import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'Новая папка 1', description: 'Имя папки' })
  name: string;

  @ApiProperty({
    example: '2 (или null)',
    description: 'id родительской папки',
  })
  parentId: number | null;
}

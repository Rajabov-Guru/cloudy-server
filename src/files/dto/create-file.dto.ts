export type FileType = 'FILE' | 'DIR';

export class CreateFileDto {
  name: string;
  parentId: number | null;
}

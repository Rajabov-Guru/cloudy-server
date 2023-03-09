export type FileType = 'FILE' | 'DIR';

export class CreateFileDto {
  name: string;
  cloudId: number;
  parentId: number | null;
}

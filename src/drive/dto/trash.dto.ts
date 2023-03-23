import { File, Folder } from '@prisma/client';

export class TrashDto {
  cloudId: number;
  targetId: number;
  parentId: number;
  dir = false;

  constructor(target: Folder | File, dir = false) {
    this.cloudId = target.cloudId;
    this.targetId = target.id;
    this.parentId = target.parentId;
    this.dir = dir;
  }
}

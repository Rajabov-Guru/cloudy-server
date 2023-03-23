import { AccessAction } from '@prisma/client';

export class ShareDto {
  accessMode = AccessAction.READ;
  dir = false;

  open: boolean = true;

  constructor(dir = false) {
    this.dir = dir;
  }
}

import { SetMetadata } from '@nestjs/common';
import { AccessAction } from '@prisma/client';

export const ACCESS_MODE = 'access_mode';

export const AccessMode = (value: AccessAction | null) =>
  SetMetadata(ACCESS_MODE, value);

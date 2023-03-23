import { SetMetadata } from '@nestjs/common';

export const IS_FOLDER_KEY = 'is_folder';

export const IsFolderEndpoint = (value: boolean) =>
  SetMetadata(IS_FOLDER_KEY, value);

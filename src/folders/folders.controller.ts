import { Body, Controller, Post } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly folderService: FoldersService) {}

  @Post()
  async create(@Body() dto: CreateFolderDto) {
    const folder = await this.folderService.createFolder(
      dto.name,
      dto.userId,
      dto.parentId,
    );
    return folder;
  }
}

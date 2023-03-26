import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TrashService } from '../services/trash.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InnersDto } from '../dto/inners.dto';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { Cloud } from '@prisma/client';
import { FoldersService } from '../services/folders.service';
import { FilesService } from '../services/files.service';

@ApiTags('Drive')
@Controller('drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly filesService: FilesService,
    private readonly trashService: TrashService,
  ) {}

  @ApiOperation({ summary: 'Получить корень хранилища' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get('root')
  async getRoot(@GetCloud() cloud: Cloud) {
    const folders = await this.foldersService.getRootFolders(cloud.id);
    const files = await this.filesService.getRootFiles(cloud.id);
    return new InnersDto(folders, files);
  } //?

  @ApiOperation({ summary: 'Получить содержимое корзины' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get('trash')
  async getTrash(@GetCloud() cloud: Cloud) {
    return this.trashService.getAll(cloud.id);
  } //?

  @ApiOperation({ summary: 'Получить содержимое Избранного' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get('favorites')
  async getFavorites(@GetCloud() cloud: Cloud) {
    const folders = await this.foldersService.getFavorites(cloud.id);
    const files = await this.filesService.getFavorites(cloud.id);
    return new InnersDto(folders, files);
  } //?

  @ApiOperation({ summary: 'Получить содержимое Заблоченных' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get('frozen')
  async getFrozen(@GetCloud() cloud: Cloud) {
    const folders = await this.foldersService.getFrozen(cloud.id);
    const files = await this.filesService.getFrozen(cloud.id);
    return new InnersDto(folders, files);
  } //?
}

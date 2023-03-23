import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Cloud } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FoldersService } from '../services/folders.service';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { GetCloud } from '../../decorators/current-cloud.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InnersDto } from '../dto/inners.dto';
import { IsFolderEndpoint } from '../../decorators/is-folder-endpoint.decorator';
import { CheckFrozenGuard } from '../guards/check-frozen.guard';
import { AccessGuard } from '../guards/access.guard';
import { ShareDto } from '../dto/share.dto';

@ApiTags('Folders')
@Controller('drive/folders')
@IsFolderEndpoint(true)
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiOperation({ summary: 'Создать папку' })
  @ApiOkResponse({ status: 200 })
  @Post()
  async create(@Body() dto: CreateFolderDto, @GetCloud() cloud: Cloud) {
    return this.foldersService.create(dto, cloud.id);
  } //?

  @ApiOperation({ summary: 'Получить корень хранилища' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @Get('root')
  async getRoot(@GetCloud() cloud: Cloud) {
    return this.foldersService.getRoot(cloud.id);
  } //?

  @ApiOperation({ summary: 'Переместить папку' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('replace/:id/:parent')
  async replace(@Param('id') id: string, @Param('parent') parent: string) {
    return this.foldersService.replace(+id, +parent);
  } //?

  @ApiOperation({ summary: 'Копировать папку' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('copy/:id/:parent')
  async copy(
    @Param('id') id: string,
    @Param('parent') parent: string,
    @GetCloud() cloud: Cloud,
  ) {
    return this.foldersService.copy(cloud, +id, +parent);
  } //?

  @ApiOperation({ summary: 'Переименовать' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Post('rename/:id/:newName')
  async rename(@Param('id') id: string, @Param('newName') newName: string) {
    return this.foldersService.rename(+id, newName);
  } //?

  @ApiOperation({ summary: 'Добавить в избранное' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('favorites/:id')
  async addToFavorites(@Param('id') id: string) {
    return this.foldersService.favorites(+id);
  } //?

  @ApiOperation({ summary: 'Закрепить' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('pin/:id')
  async pinFolder(@Param('id') id: string) {
    return this.foldersService.pin(+id);
  } //?

  @ApiOperation({ summary: 'Заблокировать' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('freeze/:id')
  async freezeFolder(@Param('id') id: string) {
    return this.foldersService.freeze(+id);
  } //?

  @ApiOperation({ summary: 'Получить содержимое папки' })
  @ApiOkResponse({ status: 200, type: InnersDto })
  @UseGuards(AccessGuard)
  @Get(':path')
  async getFolder(@Param('path') path: string, @GetCloud() cloud: Cloud) {
    return this.foldersService.getFolderInners(cloud.id, path);
  } //?

  @ApiOperation({ summary: 'Удалить папку' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard, CheckFrozenGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.foldersService.delete(+id);
  } //?

  @ApiOperation({ summary: 'Настройка доступа к папке' })
  @ApiOkResponse({ status: 200 })
  @UseGuards(AccessGuard)
  @Post('share/:id')
  async share(@Param('id') id: string, @Body() dto: ShareDto) {
    return this.foldersService.shareFolder(+id, dto);
  } //?
}

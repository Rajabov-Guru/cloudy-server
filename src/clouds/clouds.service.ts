import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCloudDto } from './dto/create-cloud.dto';
import { UpdateCloudDto } from './dto/update-cloud.dto';
import { PrismaService } from '../global-services/prisma.service';
import { FsService } from '../global-services/fs.service';
import { FoldersService } from '../drive/services/folders.service';
import { StatisticsService } from '../statistics/statistics.service';
import { FilesService } from '../drive/services/files.service';
import { InnersDto } from '../drive/dto/inners.dto';

@Injectable()
export class CloudsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(FsService)
  private readonly fsService: FsService;

  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;

  @Inject(forwardRef(() => FilesService))
  private readonly filesService: FilesService;

  @Inject(StatisticsService)
  private readonly statisticsService: StatisticsService;
  async create(createCloudDto: CreateCloudDto) {
    const cloud = await this.prisma.cloud.create({ data: createCloudDto });
    await this.statisticsService.create(cloud.id, cloud.memory);
    await this.fsService.makeDirectory(cloud.name);
    return cloud;
  }

  async getByUser(userId: number) {
    return this.prisma.cloud.findFirst({
      where: { userId },
    });
  }
  async findOne(id: number) {
    return this.prisma.cloud.findFirst({
      where: { id },
    });
  }

  update(id: number, updateCloudDto: UpdateCloudDto) {
    return this.prisma.cloud.update({
      where: { id },
      data: updateCloudDto,
    });
  }
  remove(id: number) {
    return this.prisma.cloud.delete({
      where: { id },
    });
  }
}

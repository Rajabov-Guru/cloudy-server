import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCloudDto } from './dto/create-cloud.dto';
import { UpdateCloudDto } from './dto/update-cloud.dto';
import { PrismaService } from '../prisma.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class CloudsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FilesService))
  private readonly filesService: FilesService;
  async create(createCloudDto: CreateCloudDto) {
    const cloud = await this.prisma.cloud.create({ data: createCloudDto });
    const path = this.filesService.getRootPath(cloud.name);
    this.filesService.makeDirectory(path);
    return cloud;
  }
  findOne(id: number) {
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

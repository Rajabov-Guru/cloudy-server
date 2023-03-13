import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCloudDto } from './dto/create-cloud.dto';
import { UpdateCloudDto } from './dto/update-cloud.dto';
import { PrismaService } from '../prisma.service';
import { FsService } from '../folders/fs.service';

@Injectable()
export class CloudsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FsService))
  private readonly fsService: FsService;
  async create(createCloudDto: CreateCloudDto) {
    const cloud = await this.prisma.cloud.create({ data: createCloudDto });
    this.fsService.makeDirectory(cloud.name);
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

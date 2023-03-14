import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCloudDto } from './dto/create-cloud.dto';
import { UpdateCloudDto } from './dto/update-cloud.dto';
import { PrismaService } from '../global-services/prisma.service';
import { FsService } from '../global-services/fs.service';
import { Folder } from '@prisma/client';
import { FoldersService } from '../folders/folders.service';

@Injectable()
export class CloudsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(FsService)
  private readonly fsService: FsService;

  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;
  async create(createCloudDto: CreateCloudDto) {
    const cloud = await this.prisma.cloud.create({ data: createCloudDto });
    await this.fsService.makeDirectory(cloud.name);
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

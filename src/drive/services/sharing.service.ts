import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../global-services/prisma.service';
import { ShareDto } from '../dto/share.dto';
import { SharedList } from '@prisma/client';

@Injectable()
export class SharingService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  async update(sharing: SharedList) {
    return this.prisma.sharedList.update({
      where: {
        id: sharing.id,
      },
      data: sharing,
    });
  }

  async findOne(targetId: number, dir = false) {
    return this.prisma.sharedList.findFirst({
      where: {
        folderId: dir ? targetId : null,
        fileId: !dir ? targetId : null,
        dir,
      },
    });
  }

  async share(targetId: number, dto: ShareDto) {
    return this.prisma.sharedList.create({
      data: {
        folderId: dto.dir ? targetId : null,
        fileId: !dto.dir ? targetId : null,
        dir: dto.dir,
        AccessAction: dto.accessMode,
      },
    });
  }

  async checkSharing(targetId: number, dir = false) {
    const candidate = await this.prisma.sharedList.findFirst({
      where: {
        folderId: dir ? targetId : null,
        fileId: !dir ? targetId : null,
        dir,
      },
    });
    if (candidate) {
      return candidate.AccessAction;
    } else return null;
  }
}

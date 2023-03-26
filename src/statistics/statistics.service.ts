import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../global-services/prisma.service';
import { Statistic, StatisticItem } from '@prisma/client';
import { FilesService } from '../drive/services/files.service';
import categoryExtensions, {
  CategoryExtensions,
} from './helpers/category-extensions';

@Injectable()
export class StatisticsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(forwardRef(() => FilesService))
  private readonly filesService: FilesService;

  async findOne(id: number) {
    return this.prisma.statistic.findFirst({
      where: { id },
    });
  }

  async update(stat: Statistic) {
    return this.prisma.statistic.update({
      where: { id: stat.id },
      data: stat,
    });
  }

  async create(cloudId: number, storeAmount: number) {
    return this.prisma.statistic.create({
      data: { cloudId, storeAmount },
    });
  }

  async createStatItem(statId: number, type: string, value: number) {
    return this.prisma.statisticItem.create({
      data: {
        type,
        value,
        statisticId: statId,
      },
    });
  }

  async deleteStatItems(statId: number) {
    return this.prisma.statisticItem.deleteMany({
      where: {
        statisticId: statId,
      },
    });
  }

  async getByCloud(cloudId: number) {
    return this.prisma.statistic.findFirst({
      where: { cloudId },
    });
  }

  async getStatItems(cloudId: number) {
    return this.prisma.statisticItem.findMany({
      where: {
        Statistic: {
          cloudId,
        },
      },
    });
  }

  async getByCloudName(cloudName: string) {
    return this.prisma.statistic.findFirst({
      where: {
        Cloud: {
          name: cloudName,
        },
      },
    });
  }

  async changeUsedAmount(cloudName: string, value: number) {
    const stat = await this.getByCloudName(cloudName);
    stat.usedAmount += value;
    return this.update(stat);
  }

  async analiseByCategories(cloudId: number) {
    const stat = await this.getByCloud(cloudId);
    await this.deleteStatItems(stat.id);
    const statItems: StatisticItem[] = [];
    const categoryExts = categoryExtensions;
    for (const categoryExt of categoryExts) {
      const statItem = await this.analiseByCategory(stat, categoryExt);
      statItems.push(statItem);
    }
    const sumPercent = statItems.reduce((sum, s) => s.value + sum, 0);
    const otherStatItem = await this.createStatItem(
      stat.id,
      'others',
      100 - sumPercent,
    );
    statItems.push(otherStatItem);
    return statItems;
  }

  async analiseByCategory(stat: Statistic, data: CategoryExtensions) {
    const sum = await this.filesService.getSumSizeByExt(
      stat.cloudId,
      data.extensions,
    );
    const percent = (sum / stat.usedAmount) * 100;
    return this.createStatItem(stat.id, data.category, percent);
  }
}

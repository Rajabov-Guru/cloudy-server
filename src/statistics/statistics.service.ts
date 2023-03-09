import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatisticsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
}

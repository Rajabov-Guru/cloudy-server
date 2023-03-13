import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../global-services/prisma.service';

@Injectable()
export class StatisticsService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
}

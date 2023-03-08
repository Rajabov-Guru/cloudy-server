import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Statistic } from './entities/statistic.entity';
import { StatisticItem } from './entities/statistic-item.entity';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Statistic, StatisticItem])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}

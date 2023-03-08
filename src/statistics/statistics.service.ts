import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Statistic } from './entities/statistic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  @InjectRepository(Statistic)
  private readonly statRepository: Repository<Statistic>;
}

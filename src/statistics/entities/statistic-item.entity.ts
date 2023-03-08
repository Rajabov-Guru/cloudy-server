import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Statistic } from './statistic.entity';

@Entity()
export class StatisticItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  type: string;

  @Column({ default: 0 })
  value: number;

  @ManyToOne(() => Statistic, (stat) => stat.statItems)
  statistic: Statistic;
}

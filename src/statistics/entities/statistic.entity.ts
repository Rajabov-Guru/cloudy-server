import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StatisticItem } from './statistic-item.entity';

@Entity()
export class Statistic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  storeAmount: number; //in GB

  @Column({ default: 0 })
  usedAmount: number; //in bites

  @OneToOne(() => User, (user) => user.statistic)
  user: User;

  @OneToMany(() => StatisticItem, (item) => item.statistic, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  statItems: StatisticItem[];
}

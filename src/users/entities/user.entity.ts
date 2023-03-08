import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import Token from '../../auth/entities/token.entity';
import { Statistic } from '../../statistics/entities/statistic.entity';
import { Folder } from '../../folders/entities/folder.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Token, (token) => token.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  token: Token;

  @OneToOne(() => Statistic, (stat) => stat.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  statistic: Statistic;

  @OneToMany(() => Folder, (folder) => folder.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  folders: Folder[];
}

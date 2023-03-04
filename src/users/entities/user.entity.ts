import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Token from '../../auth/entities/token.entity';

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

  @Column()
  secret: number;

  @Column({ default: 10 })
  rating: number;

  @Column({ default: false })
  isReferal: boolean;

  @Column({ default: false })
  isLoyal: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  referalsCount: number;

  @Column({ default: null, nullable: true })
  lastActionsDate: Date;

  @Column({ default: null, nullable: true })
  country: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  public refererId!: number;

  @ManyToOne(() => User, (user) => user.referals, { onDelete: 'SET NULL' })
  referer: User;

  @OneToMany(() => User, (user) => user.referer, { onDelete: 'SET NULL' })
  referals: User[];

  @OneToOne(() => Token, (token) => token.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  token: Token;
}

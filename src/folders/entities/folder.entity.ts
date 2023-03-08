import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { File } from '../../files/entities/file.entity';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  path: string;

  @Column({ default: 0 })
  size: number;

  @Column({ nullable: false })
  public userId!: number;

  @Column({ nullable: true })
  public parentId!: number;

  @OneToMany(() => Folder, (folder) => folder.parent)
  subFolders: Folder[];

  @ManyToOne(() => Folder, (folder) => folder.subFolders, { nullable: true })
  parent: Folder;

  @ManyToOne(() => User, (user) => user.folders)
  user: User;

  @OneToMany(() => File, (file) => file.folder, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  files: File[];
}

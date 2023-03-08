import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Folder } from '../../folders/entities/folder.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false })
  type: string;

  @Column({ default: 0 })
  size: number;

  @Column({ nullable: false })
  public folderId!: number;

  @ManyToOne(() => Folder, (folder) => folder.files)
  folder: Folder;
}

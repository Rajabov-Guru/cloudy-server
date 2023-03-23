import { forwardRef, Module } from '@nestjs/common';
import { FoldersService } from './services/folders.service';
import { FoldersController } from './controllers/folders.controller';
import { AuthModule } from '../auth/auth.module';
import { CloudsModule } from '../clouds/clouds.module';
import { PrismaService } from '../global-services/prisma.service';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { FsService } from '../global-services/fs.service';
import { TrashService } from './services/trash.service';
import { TrashController } from './controllers/trash.controller';
import { StatisticsModule } from '../statistics/statistics.module';
import { SharingService } from './services/sharing.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => CloudsModule),
    forwardRef(() => StatisticsModule),
  ],
  controllers: [FoldersController, FilesController, TrashController],
  providers: [
    FoldersService,
    FilesService,
    TrashService,
    SharingService,
    PrismaService,
    FsService,
  ],
  exports: [FoldersService, FilesService, TrashService, SharingService],
})
export class DriveModule {}

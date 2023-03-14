import { forwardRef, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from '../global-services/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { FoldersModule } from '../folders/folders.module';
import { FsService } from '../global-services/fs.service';
import { CloudsModule } from '../clouds/clouds.module';

@Module({
  imports: [AuthModule, forwardRef(() => FoldersModule), CloudsModule],
  controllers: [FilesController],
  providers: [FilesService, PrismaService, FsService],
  exports: [FilesService],
})
export class FilesModule {}

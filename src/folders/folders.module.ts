import { forwardRef, Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { CloudsModule } from '../clouds/clouds.module';
import { FsService } from '../global-services/fs.service';
import { PrismaService } from '../global-services/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => CloudsModule),
    forwardRef(() => FilesModule),
  ],
  controllers: [FoldersController],
  providers: [FoldersService, PrismaService, FsService],
  exports: [FoldersService],
})
export class FoldersModule {}

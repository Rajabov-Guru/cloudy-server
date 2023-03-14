import { forwardRef, Module } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CloudsController } from './clouds.controller';
import { PrismaService } from '../global-services/prisma.service';
import { FsService } from '../global-services/fs.service';
import { AuthModule } from '../auth/auth.module';
import { FoldersModule } from '../folders/folders.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => FoldersModule)],
  controllers: [CloudsController],
  providers: [CloudsService, PrismaService, FsService],
  exports: [CloudsService],
})
export class CloudsModule {}

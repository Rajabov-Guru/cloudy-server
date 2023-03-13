import { forwardRef, Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { CloudsModule } from '../clouds/clouds.module';
import { FsService } from './fs.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => CloudsModule)],
  controllers: [FoldersController],
  providers: [FoldersService, PrismaService, FsService],
  exports: [FoldersService, FsService],
})
export class FoldersModule {}

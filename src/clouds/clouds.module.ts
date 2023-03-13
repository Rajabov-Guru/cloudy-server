import { forwardRef, Module } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CloudsController } from './clouds.controller';
import { PrismaService } from '../global-services/prisma.service';
import { FsService } from '../global-services/fs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [CloudsController],
  providers: [CloudsService, PrismaService, FsService],
  exports: [CloudsService],
})
export class CloudsModule {}

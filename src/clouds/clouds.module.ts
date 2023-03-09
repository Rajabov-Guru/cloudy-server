import { forwardRef, Module } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CloudsController } from './clouds.controller';
import { PrismaService } from '../prisma.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [forwardRef(() => FilesModule)],
  controllers: [CloudsController],
  providers: [CloudsService, PrismaService],
  exports: [CloudsService],
})
export class CloudsModule {}

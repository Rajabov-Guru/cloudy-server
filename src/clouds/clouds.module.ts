import { forwardRef, Module } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CloudsController } from './clouds.controller';
import { PrismaService } from '../prisma.service';
import { FoldersModule } from '../folders/folders.module';

@Module({
  imports: [forwardRef(() => FoldersModule)],
  controllers: [CloudsController],
  providers: [CloudsService, PrismaService],
  exports: [CloudsService],
})
export class CloudsModule {}

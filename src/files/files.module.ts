import { forwardRef, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from '../prisma.service';
import { CloudsModule } from '../clouds/clouds.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, forwardRef(() => CloudsModule)],
  controllers: [FilesController],
  providers: [FilesService, PrismaService],
  exports: [FilesService],
})
export class FilesModule {}

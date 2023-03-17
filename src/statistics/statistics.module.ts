import { forwardRef, Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PrismaService } from '../global-services/prisma.service';
import { DriveModule } from '../drive/drive.module';
import { AuthModule } from '../auth/auth.module';
import { CloudsModule } from '../clouds/clouds.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => DriveModule),
    forwardRef(() => CloudsModule),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, PrismaService],
  exports: [StatisticsService],
})
export class StatisticsModule {}

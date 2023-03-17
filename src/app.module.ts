import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StatisticsModule } from './statistics/statistics.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './global-services/prisma.service';
import { CloudsModule } from './clouds/clouds.module';
import { FsService } from './global-services/fs.service';
import { DriveModule } from './drive/drive.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.${process.env.NODE_ENV}.env`],
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: path.resolve(__dirname, 'static'),
    //   serveRoot: '/',
    // }),
    UsersModule,
    AuthModule,
    StatisticsModule,
    CloudsModule,
    DriveModule,
  ],
  controllers: [],
  providers: [PrismaService, FsService],
})
export class AppModule {}

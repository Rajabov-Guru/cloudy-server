import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StatisticsModule } from './statistics/statistics.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { CloudsModule } from './clouds/clouds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.${process.env.NODE_ENV}.env`],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
      serveRoot: '/',
    }),
    UsersModule,
    AuthModule,
    FilesModule,
    StatisticsModule,
    CloudsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}

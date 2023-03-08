import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StatisticsModule } from './statistics/statistics.module';
import { FoldersModule } from './folders/folders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.${process.env.NODE_ENV}.env`],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
      serveRoot: '/',
    }),
    UsersModule,
    AuthModule,
    FilesModule,
    StatisticsModule,
    FoldersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

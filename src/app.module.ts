import { Module } from '@nestjs/common';
import {FilesModule} from "./files/files.module";
import {AuthModule} from "./auth/auth.module";
import {UsersModule} from "./users/users.module";
import * as path from "path";
import {ServeStaticModule} from "@nestjs/serve-static";
import { DbModule } from './db/db.module';


@Module({
  imports: [
    DbModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
      serveRoot: '/',
    }),
    UsersModule,
    AuthModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

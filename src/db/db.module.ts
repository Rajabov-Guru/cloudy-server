import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports:[
        ConfigModule.forRoot({
            envFilePath: [`.${process.env.NODE_ENV}.env`, '.env'],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('MYSQL_HOST'),
                port: 3306,
                username: configService.get<string>('MYSQL_USER'),
                password: configService.get<string>('MYSQL_PASSWORD'),
                database: configService.get<string>('MYSQL_DATABASE'),
                entities: ['dist/**/*.entity.js'],
                migrations: ['dist/db/migrations/*.js'],
            }),
        }),
    ]
})
export class DbModule {}

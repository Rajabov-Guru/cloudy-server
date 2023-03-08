import { DataSource, DataSourceOptions } from 'typeorm';
import { config as setConfig } from 'dotenv';

setConfig({ path: `.${process.env.NODE_ENV}.env` });
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: 3306,
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'cloudydb',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

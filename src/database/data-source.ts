import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port:  process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpassword',
  database: process.env.DB_NAME || 'taskmanager',
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

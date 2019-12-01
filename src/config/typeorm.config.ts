import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {

  type: 'mysql',
  host: '127.0.0.1',
  port: 3308,
  username: 'root',
  password: 'example',
  database: 'taskmanagement',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  logging: ["query", "error"],
  cache: true
};

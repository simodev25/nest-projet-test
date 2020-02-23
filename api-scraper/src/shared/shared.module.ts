import { DynamicModule, HttpModule, Module } from '@nestjs/common';

import { ScraperLoggerService } from './logger/loggerService';
import { createLoggerProviders } from './logger/logger.providers';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from 'nestjs-redis';


const environment = 'local';


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./config.${process.env.NODE_ENV || environment}.env`,
    }),

    ClientsModule.register([
      {
        name: 'ScraperProxyFactory',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@10.105.216.13:5672'],
          queue: 'scraper_service',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [ScraperLoggerService],
  exports: [ScraperLoggerService,
    ClientsModule.register([
      {
        name: 'ScraperProxyFactory',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@10.105.216.13:5672'],
          queue: 'scraper_service',
          queueOptions: {
            durable: false,
          },
        },
      },
    ])],
})
export class SharedModule {

  static forRoot(): DynamicModule {
    const prefixedLoggerProviders = createLoggerProviders();

    return {
      module: SharedModule,
      providers: [ScraperLoggerService, ...prefixedLoggerProviders, ConfigService],
      exports: [ScraperLoggerService, ...prefixedLoggerProviders, ConfigService],
    };
  }
}



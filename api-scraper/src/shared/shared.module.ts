import { DynamicModule, HttpModule, Module } from '@nestjs/common';

import { ScraperLoggerService } from './logger/loggerService';
import { createLoggerProviders } from './logger/logger.providers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getScraperProxyFactory } from './factorys/scraper.factory';

import {
  DNSHealthIndicator,
  MicroserviceHealthIndicator,
  MongooseHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';
import { TerminusOptionsService } from './health/terminus.options.service';
import { AppHealthIndicator } from './health/app.health.Indicator';


const environment = 'local';


@Module({
  imports: [
   /* TerminusModule.forRootAsync({
      imports: [SharedModule],
      useClass: TerminusOptionsService,
    }),*/
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./config.${process.env.NODE_ENV || environment}.env`,
    }),
  ],
  providers: [ScraperLoggerService, getScraperProxyFactory(), MicroserviceHealthIndicator, AppHealthIndicator, DNSHealthIndicator, MongooseHealthIndicator,
  ],
  exports: [ScraperLoggerService, getScraperProxyFactory(), MicroserviceHealthIndicator, AppHealthIndicator, DNSHealthIndicator, MongooseHealthIndicator,
  ],
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



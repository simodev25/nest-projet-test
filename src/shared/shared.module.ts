import { CacheModule, DynamicModule, Module } from '@nestjs/common';

import { LoggerServiceBase } from './logger/loggerService';
import { createLoggerProviders } from './logger/logger.providers';
import { CacheManager } from './cache/cacheManager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [CacheModule.register({
    store: redisStore,
    host: 'localhost',
    port: 6379,
    ttl: 60 * 10, // seconds
    max: 10, // maximum number of items in cache
  })],
  providers: [LoggerServiceBase, CacheManager],
  exports: [LoggerServiceBase, CacheModule],
})
export class SharedModule {

  static forRoot(): DynamicModule {
    const prefixedLoggerProviders = createLoggerProviders();

    return {
      module: SharedModule,
      providers: [LoggerServiceBase, CacheManager, ...prefixedLoggerProviders],
      exports: [LoggerServiceBase, CacheManager, ...prefixedLoggerProviders],
    };
  }
}



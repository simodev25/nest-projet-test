import { CacheModule, DynamicModule, Module } from '@nestjs/common';
import { ScopeService } from './scope-service.service';
import { LoggerServiceBase } from './loggerService';
import { createLoggerProviders } from './logger.providers';
import { CacheManager } from './cacheManager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [CacheModule.register({
    store: redisStore,
    host: 'localhost',
    port: 6379,
    ttl: 60 * 10, // seconds
    max: 10, // maximum number of items in cache
  })],
  providers: [ScopeService, LoggerServiceBase, CacheManager],
  exports: [ScopeService, LoggerServiceBase, CacheModule],
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



import { CacheModule, Module } from '@nestjs/common';
import { ProduitsController } from './produits.controller';
import { ProduitsService } from './produits.service';
import * as redisStore from 'cache-manager-redis-store';

import { CronModule } from 'nestjs-cron';

import { SharedModule } from '../shared/shared.module';
import { LoggerServiceBase } from '../shared/logger/loggerService';
import { LoggingInterceptor } from '../shared/logger/logging.Interceptor';

@Module({
  imports: [
    SharedModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 60 * 10, // seconds
      max: 10, // maximum number of items in cache
    }),
    CronModule.forRoot()],
  controllers: [ProduitsController],
  providers: [ProduitsService, LoggingInterceptor, LoggerServiceBase
    ]
})
export class ProduitsModule {

  constructor( private produitsService: ProduitsService) {
   //

  }

  public async onModuleInit(): Promise<void> {

    this.produitsService.initProduit();
  }

}

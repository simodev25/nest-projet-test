import { CacheModule, DynamicModule, HttpModule, Module } from '@nestjs/common';

import { LoggerServiceBase } from './logger/loggerService';
import { createLoggerProviders } from './logger/logger.providers';
import { CacheManager } from './cache/cacheManager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { NetworkService } from './request/network.service';
import { AXIOS_INSTANCE_TOKEN } from '@nestjs/common/http/http.constants';
import axios, { AxiosRequestConfig } from 'axios';
const environment = 'local';

const optionsTypegoose = {

  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: false,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,

  /* autoIndex: true, // Don't build indexes


   poolSize: 10, // Maintain up to 10 socket connections
   // If not connected, return errors immediately rather than waiting for reconnect
   bufferMaxEntries: 0,
   connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
   useUnifiedTopology: false,*/

};

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./src/config/config.${process.env.NODE_ENV || environment}.env`,
    }),
    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: false,
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 1000, // Reconnect every 500ms
        bufferMaxEntries: 0,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000
      }),
      inject: [ConfigService],
    }),

    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
      ttl: 60 * 10, // seconds
      max: 10, // maximum number of items in cache
    })],
  providers: [LoggerServiceBase, CacheManager,{
    provide: AXIOS_INSTANCE_TOKEN,
    useValue: axios,
  },],
  exports: [LoggerServiceBase, CacheModule],
})
export class SharedModule {

  static forRoot(): DynamicModule {
    const prefixedLoggerProviders = createLoggerProviders();

    return {
      module: SharedModule,
      providers: [LoggerServiceBase, CacheManager, ...prefixedLoggerProviders, ConfigService,NetworkService],
      exports: [LoggerServiceBase, CacheManager, ...prefixedLoggerProviders, ConfigService,NetworkService],
    };
  }
}



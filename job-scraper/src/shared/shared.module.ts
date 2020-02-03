import { DynamicModule, HttpModule, Module } from '@nestjs/common';

import { ScraperLoggerService } from './logger/loggerService';
import { createLoggerProviders } from './logger/logger.providers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypegooseModule } from 'nestjs-typegoose';


const environment = 'local';


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./config.${process.env.NODE_ENV || environment}.env`,
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
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ScraperLoggerService],
  exports: [ScraperLoggerService],
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



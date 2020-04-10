import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { UrlScraperController } from './urlScraper.controller';
import { UrlScraperService } from './urlScraper.service';
import { getUrlScraperProxyFactory } from '../shared/factorys/scraper.factory';

@Module({
  imports: [SharedModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'production') {
          return [];
        }
        return [{
          retryAttempts: 5,
          retryDelay: 1000,
          db: 2,
          url: configService.get('REDIS_URL'),
        }];
      },

      inject: [ConfigService],
    })],
  exports: [],
  controllers: [UrlScraperController],
  providers: [UrlScraperService, getUrlScraperProxyFactory()],
})
export class UrlScraperModule {

}

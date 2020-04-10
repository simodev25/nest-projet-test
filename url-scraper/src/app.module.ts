import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UrlScraperService } from './bin/url.scraper.service';
import { RequestManager } from './bin/request.manager';
import { TorManager } from './bin/tor.manager';
import { PuppeteerManager } from './bin/puppeteer.manager';
import { RequestFactory } from './bin/request.factory';
import { ScraperHelper } from './bin/ScraperHelper';

const environment = 'local';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./config.${process.env.NODE_ENV || environment}.env`,
    }),
  ],
  controllers: [AppController],
  providers: [ScraperHelper, PuppeteerManager, RequestManager, TorManager, AppService, RequestFactory, UrlScraperService],
})
export class AppModule {
}

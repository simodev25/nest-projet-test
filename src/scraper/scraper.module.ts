import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { NestCrawlerModule } from 'nest-crawler/dist';

import { ScraperAmazoneService } from './lib/scraperAmazone.service';

@Module({
  imports: [NestCrawlerModule],
  providers: [ScraperAmazoneService, ScraperService],
})
export class ScraperModule {
}

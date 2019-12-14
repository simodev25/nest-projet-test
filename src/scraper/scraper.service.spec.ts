import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { NestCrawlerModule } from 'nest-crawler/dist';

import { ScraperAmazoneService } from './lib/scraperAmazone.service';

describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NestCrawlerModule],
      providers: [ScraperService, ScraperAmazoneService],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {

    service.scrapeAmazoneFr();
  });
});

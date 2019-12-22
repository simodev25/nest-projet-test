import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';


import { ScraperAmazoneService } from './lib/scraperAmazone.service';

describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ScraperService, ScraperAmazoneService],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {

    service.scrapeAmazoneFr();
  });
});

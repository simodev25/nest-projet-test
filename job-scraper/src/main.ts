import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { MerchantwordsService } from './scraper/merchantwords.service';

async function bootstrap() {

  const scraperModule = await NestFactory.createApplicationContext(ScraperModule);

  const scraperService: ScraperService = scraperModule.get(ScraperService);
  const merchantwordsService: MerchantwordsService = scraperModule.get(MerchantwordsService);
  //scraperService.scrapeJobStart();
  merchantwordsService.merchantwordsJobStart();
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { MerchantwordsService } from './scraper/merchantwords.service';
import { MicroserviceModule } from './microservices/microservice.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ScraperRequest } from './microservices/scraperRequest';

async function bootstrap() {
  const scraperMicroservice$ = await NestFactory.create(MicroserviceModule);
  const scraperService: ScraperService = scraperMicroservice$.get(ScraperService);
  const scraperRequest: ScraperRequest = new ScraperRequest(null, '2617941011');
  scraperService.scrapeByCategory(scraperRequest).subscribe()
  switch (process.env.JOB) {

    case 'merchantwordsJob' :
      const scraperModulemerchantwordsJob = await NestFactory.createApplicationContext(ScraperModule);
      const merchantwordsService: MerchantwordsService = scraperModulemerchantwordsJob.get(MerchantwordsService);
      merchantwordsService.merchantwordsJobStart();
      break;

    case 'scrapeJob':
      const scraperModulescrapeJob = await NestFactory.createApplicationContext(ScraperModule);
      const scraperService: ScraperService = scraperModulescrapeJob.get(ScraperService);
      scraperService.scrapeJobStart();
      break;

    case 'scrapeMicroservice':
      const scraperMicroservice = await NestFactory.create(MicroserviceModule);
      const guestUrls = scraperMicroservice.get(ConfigService).get<string>('AMQP_URL').split(',');
      scraperMicroservice.connectMicroservice({
        transport: Transport.RMQ,
        options: {
          urls: guestUrls,
          queue: 'scraper_service',
          queueOptions: {
            durable: false,
          },
        },
      });
      await scraperMicroservice.startAllMicroservicesAsync();


      break;

  }

  // merchantwordsService.getAllMerchantwords().subscribe(console.log)
}

bootstrap();

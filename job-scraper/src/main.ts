import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { MerchantwordsService } from './scraper/merchantwords.service';
import { MicroserviceModule } from './microservices/microservice.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const scraperMicroservice = await NestFactory.create(MicroserviceModule);
  scraperMicroservice.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [scraperMicroservice.get(ConfigService).get('AMQP_URL')],
      queue: 'scraper_service',
      queueOptions: {
        durable: false,
      },
    },
  });
  await scraperMicroservice.startAllMicroservicesAsync();

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
      scraperMicroservice.connectMicroservice({
        transport: Transport.RMQ,
        options: {
          urls: [scraperMicroservice.get(ConfigService).get('AMQP_URL')],
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

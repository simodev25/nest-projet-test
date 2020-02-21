import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { MerchantwordsService } from './scraper/merchantwords.service';
import { MicroserviceModule } from './microservices/microservice.module';

async function bootstrap() {


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
      const scraperMicroservice = await NestFactory.createMicroservice(MicroserviceModule, {});

      await scraperMicroservice.listen(() => {

        console.log('microservice successfully started');
      });
      break;

  }

  // merchantwordsService.getAllMerchantwords().subscribe(console.log)
}

bootstrap();

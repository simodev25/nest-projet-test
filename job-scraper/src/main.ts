import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { MerchantwordsService } from './scraper/merchantwords.service';
import { MicroserviceModule } from './microservices/microservice.module';

async function bootstrap() {

  const scraperModule = await NestFactory.createApplicationContext(ScraperModule);

  const scraperService: ScraperService = scraperModule.get(ScraperService);
  const merchantwordsService: MerchantwordsService = scraperModule.get(MerchantwordsService);
  //scraperService.scrapeJobStart();
  switch (process.env.JOB) {

    case 'merchantwordsJob' :
      merchantwordsService.merchantwordsJobStart();
      break;

    case 'scrapeJob':
      scraperService.scrapeJobStart();
      break;
  }
 /* const scraperMicroservice = await NestFactory.createMicroservice(MicroserviceModule, {});

  await scraperMicroservice.listen(() => {

    console.log('microservice successfully started');
  })*/
  // merchantwordsService.getAllMerchantwords().subscribe(console.log)
}

bootstrap();

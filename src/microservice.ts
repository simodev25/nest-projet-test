import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';

async function microservice() {

  const log = new Logger('microservice')

  const scraperModule = await NestFactory.createMicroservice(ScraperModule);



  await scraperModule.listen(() => {

    log.verbose('scraperModule service successfully started');
  })

}

microservice();

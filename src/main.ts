import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ValidationFiltre } from './tasks/filters/validation-filtre';

import { ExceptionFactory } from './shared/Exception/exception-factory';
import { ProduitsModule } from './produits/produits.module';
import { Transport } from '@nestjs/common/enums/transport.enum';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './shared/logger/logging.Interceptor';
import { LoggerServiceBase } from './shared/logger/loggerService';
import * as winston from 'winston';
import { format } from 'winston';
import * as path from 'path';
import { ScraperModule } from './scraper/scraper.module';

import { ScraperService } from './scraper/scraper.service';


async function bootstrap() {
  //const app = await NestFactory.create(AppModule, {});
  const log = new Logger('microservice.ts');

  /* const produitMicroservice = await NestFactory.createMicroservice(ProduitsModule, {
     transport: Transport.REDIS,
     options: {
       url: 'redis://127.0.0.1:6379',
     },
   });

   app.useGlobalFilters(new ValidationFiltre());

     app.useGlobalPipes(new ValidationPipe({
      exceptionFactory: (errors) => ExceptionFactory.validationPipe(errors),
    }));
    await produitMicroservice.listen(() => {

      log.verbose('microservice successfully started');

     })

   app.useLogger((winston as any).createLogger({
     level: 'debug',

     transports: [

       new winston.transports.File({ filename: 'error.log', level: 'error' }),
     ],
   }));

   await app.listen(3001);*/

  const scraperModule = await NestFactory.createApplicationContext(ScraperModule, {});
  const scraperService: ScraperService = scraperModule.get(ScraperService);
  await  scraperService.scrapeAmazoneSearchWord('sport').subscribe(console.log);

}

bootstrap();

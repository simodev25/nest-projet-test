import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';


import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { Merchantwords } from '../scraper/product/merchantwords';
import { ScraperService } from '../scraper/scraper.service';
import { ScraperRequest } from './scraperRequest';

@Controller()
export class ProduitsController {

  constructor(@Logger({
                context: 'scraperMicroService',
                prefix: 'ProduitsController',
              }) private logger: ScraperLoggerService,
              private scraperService: ScraperService) {

  }


  @MessagePattern({ cmd: 'scrapeSearchWordLite' })
  scrapeSearchWordLite(searchWord: string): Observable<Merchantwords[]> {
    return this.scraperService.scrapeSearchWordLite(searchWord);
  }

  @MessagePattern({ cmd: 'scrapeSearchWordAsync' })
  scrapeSearchWordAsync(@Payload() scraperRequest: ScraperRequest, @Ctx() context: RmqContext): Observable<Merchantwords[]> {
    return this.scraperService.scrapeSearchWordAsync(scraperRequest);
  }

  @MessagePattern({ cmd: 'scrapeByAsin' })
  scrapeByAsin(@Payload() scraperRequest: ScraperRequest, @Ctx() context: RmqContext): Observable<Merchantwords[]> {

    return this.scraperService.scrapeByAsin(scraperRequest);
  }

}

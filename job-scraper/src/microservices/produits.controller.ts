import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Observable } from 'rxjs';


import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { Merchantwords } from '../scraper/product/merchantwords';
import { ScraperService } from '../scraper/scraper.service';

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
    console.log(searchWord)
    return this.scraperService.scrapeSearchWordLite(searchWord);
  }

  @MessagePattern({ cmd: 'scrapeSearchWordAsync' })
  scrapeSearchWordAsync(searchWord: string): Observable<Merchantwords[]> {

    return this.scraperService.scrapeSearchWordAsync(searchWord);
  }


}

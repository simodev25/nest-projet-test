import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { MerchantwordsService } from '../scraper/merchantwords.service';
import { Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Merchantwords } from '../scraper/product/merchantwords';

@Injectable()
export class MerchantwordsController {

  constructor(@Logger({
                context: 'scraperMicroService',
                prefix: 'ProduitsController',
              }) private logger: ScraperLoggerService,
              private merchantwordsService: MerchantwordsService) {

  }

  @MessagePattern({ cmd: 'merchantwords' })
  merchantwords(): Observable<Merchantwords[]> {
    console.log('micro in merchantwords ')
    return this.merchantwordsService.getMerchantwords();
  }

}

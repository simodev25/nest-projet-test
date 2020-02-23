import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { MerchantwordsService } from '../scraper/merchantwords.service';
import { Injectable } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
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
  merchantwords(@Payload() data: number[], @Ctx() context: RmqContext): Observable<Merchantwords[]> {
    return this.merchantwordsService.getMerchantwords();
  }

}

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Observable } from 'rxjs';


import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { MerchantwordsService } from '../scraper/merchantwords.service';

@Controller()
export class ProduitsController {

  constructor(@Logger({
    context: 'scraperMicroService',
    prefix: 'ProduitsController',
  }) private logger: ScraperLoggerService,
              private merchantwordsService: MerchantwordsService) {

  }


  @MessagePattern({ cmd: 'getProducts' })
  getProducts(): Observable<any> {
    this.logger.debug(' getProducts');
    this.merchantwordsService.getAllMerchantwords().subscribe(console.log)
    return this.merchantwordsService.getAllMerchantwords();
  }
}

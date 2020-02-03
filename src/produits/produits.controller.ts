import { CacheInterceptor, Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProduitsService } from './produits.service';
import { Observable } from 'rxjs';
import { MicroCacheInterceptor } from './micro.cacheInterceptor';
import { LoggerServiceBase } from '../shared/logger/loggerService';
import { Logger } from '../shared/logger/logger.decorator';

@Controller()
export class ProduitsController {

  constructor( @Logger({
    context: 'produitsMicroService',
    prefix: 'produitsController',
  }) private logger: LoggerServiceBase, private produitsService: ProduitsService) {

  }

  @MessagePattern({ cmd: 'sum' })
  sum(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }

  @MessagePattern({ cmd: 'getProducts' })
 // @UseInterceptors(MicroCacheInterceptor)
  getProducts(store: string): Observable<any> {
    this.logger.debug(' getProducts');
    return this.produitsService.getProducts(store);
  }
}

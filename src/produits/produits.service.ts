import { Injectable } from '@nestjs/common';
import { of, Observable } from 'rxjs';

import { Cron, Scheduled } from 'nestjs-cron';

import { LoggerServiceBase } from '../shared/loggerService';
import { Logger } from '../shared/logger.decorator';
import { logMethod } from '../shared/interceptors/use-interceptors.decorator';
import { LoggingInterceptor } from '../shared/logging.Interceptor';

@Injectable()
@Scheduled()
export class ProduitsService  {
  constructor( @Logger({
    context: 'ProduitsMicroService',
    prefix: 'ProduitsService',
  }) private logger: LoggerServiceBase){

  }

  produit = [];

  //@logMethod(LoggingInterceptor)
  public getProducts(store: string): Observable<any> {
    console.log('ProduitsServicetProducts**')
    this.logger.debug('ProduitsServicetProducts');
    return of(this.produit);

  }
  @Cron('10 * * * * *')
  public initProduit() {
    this.logger.debug('initProduit');
    const produits = [];
    for (let i = 0; i < 10000; i++) {
      const produit = { 'id': 22, 'name': 'etettete.js', 'store': 'store1' };
      produits.push(produit);
    }

    this.produit = produits;
  }

}

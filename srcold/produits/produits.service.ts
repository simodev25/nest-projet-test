import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { Cron, Scheduled } from 'nestjs-cron';

import { LoggerServiceBase } from '../shared/logger/loggerService';
import { Logger } from '../shared/logger/logger.decorator';

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
      const produit = { 'id': 22, 'name': 'etettete', 'store': 'store1' };
      produits.push(produit);
    }

    this.produit = produits;
  }

}

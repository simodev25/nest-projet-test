import { Injectable } from '@nestjs/common';
import { filter, map, mapTo, max, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { RxjsUtils } from '../shared/utils/rxjs-utils';
import { plainToClass } from 'class-transformer';
import { format } from 'util';
import { ProductDetail } from './product/productDetail';
import { ScraperHelper } from './ScraperHelper';
import { Product } from './product/product';
import { ProductRepository } from './schema/product.repository';
import { ProductReviews } from './product/productReviews';
import { Cron, Scheduled } from 'nestjs-cron';
import { Logger } from '../shared/logger/logger.decorator';
import { LoggerServiceBase } from '../shared/logger/loggerService';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './lib/proxy.service';

@Injectable()
@Scheduled()
export class ScraperService {
  constructor(@Logger({
                context: 'ScraperMicroService',
                prefix: 'ScraperService',
              }) private logger: LoggerServiceBase,
              private readonly productRepository: ProductRepository,
              private readonly scraperAmazone: ScraperAmazoneService,
              private readonly proxyService: ProxyService) {

  }



  //@Cron('5 * * * * *', { launchOnInit: true, sync: true })
  public scrapeAmazone() {
    const start = Date.now();

    this.logger.debug('scrapeAmazone start ...');
    ScraperHelper.KEYWORD_LIST.forEach(keyword=> {
      this.scrapeAmazoneSearchWord(keyword).subscribe((count: any) => {

        this.logger.debug(`keyword :[${keyword}] number of products processed [${count}]`);
        this.logger.debug(format(
          '%s %s %dms %s',
          'scrapeAmazone',
          'end .',
          Date.now() - start,
          '',
          '',
        ));
      }, error1 => {
        console.log(error1)
        this.logger.error(error1);
      });
    })


  }

  public scrapeAmazoneSearchWord(searchWord: string): Observable<number> {
    let productCount: number = 0;
    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);

    const scrapeAmazoneSearchWord = this.scraperAmazone
      .scrapeUrlHome(`${baseUrlAmazone}s?k=${searchWord.replace(/\\s/g, '+').trim()}&i=garden`)
      .pipe(
        mergeMap(produit => from(produit)),
        map(produit => {

          const produitClass: Product = plainToClass(Product, produit);
          produitClass.searchWord = searchWord;
          produitClass.baseUrl = baseUrlAmazone;
          produitClass.country = country;
          produitClass.currency = ScraperHelper.getCurrency(country);


          return produitClass;
        }),
        mergeMap((produitClass: Product) => from(produitClass.isValideProduct()).pipe(
          filter(Boolean),
          mapTo(produitClass),
        )),
        mergeMap((produitClass: Product) => {
          this.logger.log(`find product asin [${produitClass.asin}]`)
          return this.scraperAmazone.productDetail(produitClass.link, baseUrlAmazone).pipe(
            map((productDetail) => plainToClass(ProductDetail, productDetail)),
            mergeMap((productDetail: ProductDetail) => from(productDetail.isValideProduct()).pipe(
              filter(Boolean),
              mapTo(productDetail),
            )),
            map((productDetail: ProductDetail) => {
              this.logger.log(`find productDetail asin [${produitClass.asin}]`)
              produitClass.productDetail = productDetail;
              return produitClass;
            }),
          );

        }),

        mergeMap((produitClass: Product) => {
          return of(produitClass.productDetail.linkReviews).pipe(
            filter((linkReviews) => linkReviews != null),
            mergeMap((linkReviews) => {
              return this.scraperAmazone.productReviews(linkReviews).pipe(
                map((productReviews) => plainToClass(ProductReviews, productReviews)),
                map((productReviews: ProductReviews) => {
                  // produitClass.productDetail = productReviews;
                  this.logger.log(`find productReviews asin [${produitClass.asin}]`)
                  produitClass.productDetail.productReviews = productReviews;
                  return produitClass;
                }),
              );
            }),
          );
        }),
        mergeMap((produitClass: Product) => {
          productCount++;
          // console.log(produitClass)
          this.logger.log(`find productDetail asin [${produitClass.asin}]`)
          return this.productRepository.saveProduct(produitClass);
          //  return productCount;
        }),
        map(() => productCount),
        max(),
      );

    return scrapeAmazoneSearchWord;
  }

}

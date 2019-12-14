import { Injectable, NotFoundException } from '@nestjs/common';
import { catchError, map, mergeMap, retryWhen, take } from 'rxjs/operators';
import { from, Observable, throwError } from 'rxjs';
import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { RxjsUtils } from './rxjs-utils';
import { plainToClass } from 'class-transformer';
import { Product } from './product/product';
import { ProductDetail } from './product/productDetail';

@Injectable()
export class ScraperService {
  constructor(private readonly scraperAmazone: ScraperAmazoneService) {

  }

  public scrapeMenuAmazoneFr() {

    const scrapeAmazone = this.scraperAmazone.scrapeMenuHome('https://www.amazon.com').pipe(
      retryWhen(RxjsUtils.genericRetryStrategy({
        scalingDuration: 2000,
        excludedStatusCodes: [500],
      })),
      mergeMap(searchWords => from(searchWords)),
      catchError(error => throwError(error)),
    );

    return scrapeAmazone;

  }

  private scrapeAmazoneUrlHome(searchWord: string): Observable<Product> {
    const scrapeUrlHome = this.scraperAmazone.scrapeUrlHome(`https://www.amazon.com/s?k=${searchWord}`).pipe(
      retryWhen(RxjsUtils.genericRetryStrategy({
        scalingDuration: 2000,
        excludedStatusCodes: [500],
      })),
      mergeMap(produit => from(produit)),
      catchError(error => throwError(error)),
      map(produit => {
        const produitClass: Product = plainToClass(Product, produit);

        produitClass.productDetail = this.scraperAmazone.productDetail(produitClass.link)
          .pipe(map(productDetail => plainToClass(ProductDetail, productDetail)));

        return produitClass;
      }),
    );

    return scrapeUrlHome;
  }

  public scrapeAmazoneFr() {

    const scrapeMenuAmazoneFr = this.scrapeMenuAmazoneFr().pipe(map(take(1), (searchWord: string) => {
      console.log('**', searchWord);
      return this.scrapeAmazoneUrlHome(searchWord);
    }));
    scrapeMenuAmazoneFr.subscribe();

    const scrapeAmazoneUrlHome = this.scrapeAmazoneUrlHome('kaka').pipe(take(1));
    //scrapeAmazoneUrlHome.subscribe();
  }
}

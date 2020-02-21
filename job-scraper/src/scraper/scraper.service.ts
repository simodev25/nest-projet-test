import { Injectable, OnModuleInit } from '@nestjs/common';
import { catchError, filter, map, mapTo, max, mergeMap, scan, take, tap, timeout, toArray } from 'rxjs/operators';
import { concat, from, Observable, of, Subject, Subscription } from 'rxjs';
import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { classToPlain, plainToClass } from 'class-transformer';
import { format } from 'util';
import { ProductDetail } from './product/productDetail';
import { ScraperHelper } from './ScraperHelper';
import { Product } from './product/product';
import { ProductRepository } from './schema/product.repository';
import { ProductReviews } from './product/productReviews';
import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { MerchantwordsService } from './merchantwords.service';
import { isNil } from '../shared/utils/shared.utils';

class Keywords {
  private counter: number = 0;
  private keywords: string[];
  private keywordLength: number = 0;

  constructor(keywords: string[]) {
    this.keywords = keywords;
    this.keywordLength = keywords.length;
  }

  public next(): string {
    return this.keywords[this.counter++];

  }

  public hasNext(): boolean {
    return this.counter < this.keywordLength;
  }
}

enum JobScrapeStatus {

  START = 'START',
  STOP = 'STOP',
  ERROR = 'ERROR',

}

@Injectable()
export class ScraperService implements OnModuleInit {

  constructor(@Logger({
                context: 'scraperMicroService',
                prefix: 'scraperService',
              }) private logger: ScraperLoggerService,
              private readonly productRepository: ProductRepository,
              private readonly scraperAmazone: ScraperAmazoneService,
              private readonly merchantwordsService: MerchantwordsService) {

  }

  private scrapeSearchWord$: Subscription = null;
  private scrapeKeyword$: Subject<boolean> = new Subject<boolean>();
  private jobScrape: { startTime?: number, endTime?: number, status: JobScrapeStatus } = { status: JobScrapeStatus.STOP };
  private keywords: Keywords = null;

  onModuleInit() {
    this.scrapeAmazone();
  }

  private scrapeAmazone() {

    let count: number = 0;

    this.scrapeKeyword$.pipe(filter((hasNext: boolean) => {

      if (hasNext === false) {
        this.jobScrape.status = JobScrapeStatus.STOP;
        this.jobScrape.endTime = Date.now();

        this.logger.log(`number of ALL products  processed [${count}] scrapeAmazone end in  ${format(
          '%s %s %dms %s',
          '',
          '',
          Date.now() - this.jobScrape.startTime,
          '',
          '',
        )}`);
        process.exit();
      }
      return hasNext === true;

    })).subscribe((hasNext: boolean) => {

      const keyword = this.keywords.next();
      this.logger.log(` scrape keyword :[${keyword}] start`);
      const start = Date.now();
      this.scrapeSearchWord$ = this.scrapeSearchWordSync(keyword).pipe(
        map((count$: any) => {
          count = count + count$;
          this.logger.log(`keyword :[${keyword}] number of products processed [${count$}] ${format(
            '%s %s %dms %s',
            '',
            'end .',
            Date.now() - start,
            '',
            '',
          )}`);

        })).subscribe(() => {
      }, (error => {
        this.jobScrape.status = JobScrapeStatus.STOP;
        this.jobScrape.endTime = Date.now();
        this.logger.error(error);
        process.exit(1);
      }), () => {
        this.logger.log(`scrapeKeyword$next ...`);
        this.scrapeKeyword$.next(this.keywords.hasNext());
      });

    });

    // this.scrapeJobStart();

  }

  public scrapeJobStart(): void {

    this.logger.log(`scrapeJobStart...`);
    this.logger.log(`getAllMerchantwords...`);
    this.merchantwordsService.getAllMerchantwords().subscribe((keywords: string[]) => {
      this.logger.log(`number of ALL Merchantwords   [${keywords.length}] `);
      this.keywords = new Keywords(keywords);
      this.jobScrape.status = JobScrapeStatus.START;
      this.jobScrape.startTime = Date.now();
      this.scrapeKeyword$.next(this.keywords.hasNext());
    });

  }

  public scrapeSearchWordLite(searchWord: string): Observable<any> {
    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);

    const scrapeAmazoneSearchWord = this.scraperAmazone
      .scrapeUrlHome(`${baseUrlAmazone}s?k=${searchWord.replace(/\\s/g, '+').trim()}&i=garden`)
      .pipe(
        mergeMap(products => {
          this.logger.log(`number of products [${products.length}] `);
          return from(products);
        }),
        map(produit => {

          const produitClass: Product = plainToClass(Product, produit);
          produitClass.searchWord = searchWord;
          produitClass.baseUrl = baseUrlAmazone;
          produitClass.country = country;
          produitClass.currency = ScraperHelper.getCurrency(country);
          produitClass.site = baseUrlAmazone;
          return produitClass;
        }),
        mergeMap((produitClass: Product) => from(produitClass.isValideProduct()).pipe(
          filter(Boolean),
          mapTo(produitClass),
        )),
        map((produitClass: Product) => {
          return classToPlain(produitClass);
        }),
        toArray(),
      );

    return scrapeAmazoneSearchWord;
  }

  public scrapeSearchWordAsync(searchWord: string): Observable<any> {

    const scrapeAmazoneSearchWord: Observable<any> = this.scrapeSearchWord(searchWord).pipe(
      tap((produitClass: Product) => {
        this.logger.debug(`saveProduct asin [${produitClass.asin}] in `);
        this.productRepository.saveProduct(produitClass).subscribe();
      }),
      map((produitClass: Product) => {
        return classToPlain(produitClass);
      }),
      toArray(),
    );

    return scrapeAmazoneSearchWord;
  }

  public scrapeSearchWordSync(searchWord: string): Observable<number> {

    const scrapeAmazoneSearchWord: Observable<any> = this.scrapeSearchWord(searchWord).pipe(
      mergeMap((produitClass: Product) => {

        this.logger.debug(`saveProduct asin [${produitClass.asin}] in `);
        return this.productRepository.saveProduct(produitClass).pipe(
          timeout(10000),
          catchError(error => {
            this.logger.error(`saveProduct asin [${produitClass.asin}] timeout `);
            return of(null);
          }),
          mapTo(produitClass),
          tap(( produitClass$ : Product) => {
            this.logger.debug(`saveProduct asin [${produitClass.asin}] out `);
          }),
        );
      }),
      scan((a, c) => [...a, c], []),
      tap((products: Product[]) => {
        this.logger.debug(`saveProduct length [${products.length}] out `);
      }),
      map((products: Product[]) => products.length),
    );

    return scrapeAmazoneSearchWord;
  }

  private scrapeSearchWord(searchWord: string): Observable<any> {

    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);

    const scrapeAmazoneSearchWord = this.scraperAmazone
      .scrapeUrlHome(`${baseUrlAmazone}s?k=${searchWord.replace(/\\s/g, '+').trim()}&i=garden`)
      .pipe(
        mergeMap(products => {
          this.logger.log(`number of products [${products.length}] `);
          return from(products);
        }),
        map(produit => {

          const produitClass: Product = plainToClass(Product, produit);
          produitClass.searchWord = searchWord;
          produitClass.baseUrl = baseUrlAmazone;
          produitClass.country = country;
          produitClass.currency = ScraperHelper.getCurrency(country);
          produitClass.site = baseUrlAmazone;
          return produitClass;
        }),
        mergeMap((produitClass: Product) => from(produitClass.isValideProduct()).pipe(
          filter(Boolean),
          mapTo(produitClass),
        )),
        mergeMap((produitClass: Product) => {
          const start = Date.now();
          this.logger.debug(`find product asin [${produitClass.asin}]`);
          return this.scraperAmazone.productDetail(produitClass.link, baseUrlAmazone).pipe(
            map((productDetail) => plainToClass(ProductDetail, productDetail)),
            mergeMap((productDetail: ProductDetail) => from(productDetail.isValideProduct()).pipe(
              filter(Boolean),
              mapTo(productDetail),
            )),

            map((productDetail: ProductDetail) => {

              this.logger.debug(`find productDetail asin [${produitClass.asin}]  in ${Date.now() - start}ms`);
              produitClass.productDetail = productDetail;
              return produitClass;
            })

            ,
          );

        }),

        mergeMap((produitClass: Product) => {
          return of(produitClass.productDetail.linkReviews).pipe(
            filter((linkReviews) => linkReviews != null),
            mergeMap((linkReviews) => {
              const start = Date.now();
              return this.scraperAmazone.productReviews(linkReviews).pipe(
                map((productReviews) => plainToClass(ProductReviews, productReviews)),
                map((productReviews: ProductReviews) => {
                  // produitClass.productDetail = productReviews;
                  this.logger.debug(`find productReviews asin [${produitClass.asin}] in ${Date.now() - start}ms`);
                  produitClass.productDetail.productReviews = productReviews;
                  return produitClass;
                }),
              );
            }),
          );
        }),
      );

    return scrapeAmazoneSearchWord;
  }

}

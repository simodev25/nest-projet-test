import { Injectable, OnModuleInit } from '@nestjs/common';
import { filter, map, mapTo, max, mergeMap, switchMap, tap } from 'rxjs/operators';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { plainToClass } from 'class-transformer';
import { format } from 'util';
import { ProductDetail } from './product/productDetail';
import { ScraperHelper } from './ScraperHelper';
import { Product } from './product/product';
import { ProductRepository } from './schema/product.repository';
import { ProductReviews } from './product/productReviews';
import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { isNil } from '../shared/utils/shared.utils';
import { ConfigService } from '@nestjs/config';
import { throws } from 'assert';
import { Exception } from '../shared/Exception/exception';
import { MerchantwordsService } from './merchantwords.service';

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
        this.logger.debug(`number of ALL products  processed [${count}] scrapeAmazone end in  ${format(
          '%s %s %dms %s',
          '',
          '',
          Date.now() - this.jobScrape.startTime,
          '',
          '',
        )}`);
        console.log(`number of ALL products  processed [${count}] scrapeAmazone end in  ${format(
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
      this.logger.debug(` scrape keyword :[${keyword}] start`);
      const start = Date.now();
      this.scrapeSearchWord$ = this.scrapeSearchWord(keyword).pipe(
        map((count$: any) => {
          count = count + count$;
          this.logger.debug(`keyword :[${keyword}] number of products processed [${count$}] ${format(
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

  public scrapeSearchWord(searchWord: string): Observable<number> {

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
          produitClass.site = baseUrlAmazone;
          return produitClass;
        }),
        mergeMap((produitClass: Product) => from(produitClass.isValideProduct()).pipe(
          filter(Boolean),
          mapTo(produitClass),
        )),
        mergeMap((produitClass: Product) => {
          const start = Date.now();
          this.logger.log(`find product asin [${produitClass.asin}]`);
          return this.scraperAmazone.productDetail(produitClass.link, baseUrlAmazone).pipe(
            map((productDetail) => plainToClass(ProductDetail, productDetail)),
            mergeMap((productDetail: ProductDetail) => from(productDetail.isValideProduct()).pipe(
              filter(Boolean),
              mapTo(productDetail),
            )),

            map((productDetail: ProductDetail) => {

              this.logger.log(`find productDetail asin [${produitClass.asin}]  in ${Date.now() - start}ms`);
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
                  this.logger.log(`find productReviews asin [${produitClass.asin}] in ${Date.now() - start}ms`);
                  produitClass.productDetail.productReviews = productReviews;
                  return produitClass;
                }),
              );
            }),
          );
        }),
        mergeMap((produitClass: Product) => {
          this.logger.log(`saveProduct asin [${produitClass.asin}] in `);
          return this.productRepository.saveProduct(produitClass);
        }),
        map((produitClass: any) => {
          this.logger.log(`saveProduct asin [${produitClass.asin}] out `);
          return ++productCount;
        }),
        max(),
      );

    return scrapeAmazoneSearchWord;
  }

}

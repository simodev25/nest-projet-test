import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { catchError, filter, map, mapTo, mergeMap, scan, tap, timeout, toArray } from 'rxjs/operators';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
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
import { ScraperRequest } from '../microservices/scraperRequest';
import { error } from 'winston';

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
      count = 0;
      return hasNext === true;

    })).subscribe((hasNext: boolean) => {

      const keyword = this.keywords.next();
      this.logger.log(` scrape keyword :[${keyword}] start`);
      const start = Date.now();
      this.scrapeSearchWord$ = this.scrapeSearchWordSync(new ScraperRequest(keyword)).subscribe((count$: any) => {
        count = count + count$;
        this.logger.log(`keyword :[${keyword}] number of products processed [${count}]`);
      }, (error => {
        this.jobScrape.status = JobScrapeStatus.STOP;
        this.jobScrape.endTime = Date.now();
        this.logger.error(error);
        process.exit(1);
      }), () => {
        this.logger.log(`keyword :[${keyword}] number of products processed [${count}] ${format(
          '%s %s %dms %s',
          '',
          'end .',
          Date.now() - start,
          '',
          '',
        )}`);
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

  public scrapeSearchWordLite(searchWord: string): Observable<Product[]> {
    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);
    const start = Date.now();
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
        tap((produitClasss: Product[]) => {
          this.logger.debug(`send produits SearchWord ${searchWord} count [${produitClasss.length}] in ${Date.now() - start}ms `);
        }),
      );

    return scrapeAmazoneSearchWord;
  }

  public scrapeSearchWordAsync(scraperRequest: ScraperRequest): Observable<any> {
    const start = Date.now();
    const scrapeAmazoneSearchWord: Observable<any> = this.scrapeSearchWord(scraperRequest).pipe(
      tap((produitClass: Product) => {
        this.logger.debug(`saveProduct asin [${produitClass.asin}] in `);
        this.productRepository.saveProduct(produitClass).subscribe(() => {

        }, error => {
          this.logger.error(`saveProduct errr [${error}] ASIN [${produitClass.asin}] link [${produitClass.link}] `);
        });
      }),
      map((produitClass: Product) => {
        return classToPlain(produitClass);
      }),
      toArray(),
      tap((produitClasss: Product[]) => {
        this.logger.log(`send produits SearchWord ${scraperRequest.searchWord} count [${produitClasss.length}] in ${Date.now() - start}ms `);
      }),
    );

    return scrapeAmazoneSearchWord;
  }

  public scrapeByAsin(scraperRequest: ScraperRequest): Observable<any> {
    const start = Date.now();

    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);
    const produitClass: Product = new Product();
    produitClass.searchWord = scraperRequest.searchWord;
    produitClass.baseUrl = baseUrlAmazone;
    produitClass.country = country;
    produitClass.currency = ScraperHelper.getCurrency(country);
    produitClass.site = baseUrlAmazone;
    produitClass.link = `${baseUrlAmazone}/dp/${scraperRequest.searchWord}`;
    produitClass.asin = scraperRequest.searchWord;

    const scrapeAmazoneSearchWord: Observable<any> = this.getProductDetail(produitClass, baseUrlAmazone, scraperRequest.idRequest).pipe(
      mergeMap((produitClass$: Product) => this.getProductReviews(produitClass$, scraperRequest.idRequest)),
      tap((produitClass$: Product) => {
        produitClass$.title = produitClass$.productDetail.productTitle;
        this.logger.debug(`saveProduct asin [${produitClass$.asin}] in `);
        this.productRepository.saveProduct(produitClass$).subscribe(() => {

        }, error => {
          this.logger.error(`saveProduct errr [${error}] ASIN [${produitClass.asin}] link [${produitClass.link}] `);
        });
      }),
      map((produitClass$: Product) => {
        this.logger.log(`send produits SearchWord ${scraperRequest.searchWord} count [1] in ${Date.now() - start}ms `);
        return classToPlain(produitClass$);
      }),
      catchError((error: any) => {

        return of(new NotFoundException(`ASIN with ID [${produitClass.asin}] not found`));
      }),
      toArray(),
    );

    return scrapeAmazoneSearchWord;
  }

  public scrapeSearchWordSync(scraperRequest: ScraperRequest): Observable<number> {

    const scrapeAmazoneSearchWord: Observable<any> = this.scrapeSearchWord(scraperRequest).pipe(
      mergeMap((produitClass: Product) => {

        this.logger.debug(`saveProduct asin [${produitClass.asin}] in `);
        return this.productRepository.saveProduct(produitClass).pipe(
          timeout(10000),
          catchError(error => {
            this.logger.error(`saveProduct asin [${produitClass.asin}] timeout `);
            return of(null);
          }),
          mapTo(produitClass),
          tap((produitClass$: Product) => {
            this.logger.debug(`saveProduct asin [${produitClass.asin}] out `);
          }),
        );
      }),
      scan((a, c) => [...a, c], []),
      tap((products: Product[]) => {
        this.logger.debug(`saveProduct length [${products.length}] out `);
      }),
      map((products: Product[]) => products.length),
      timeout(50000),
      catchError(error => {
        this.logger.error(`............... timeout `);
        return of(null);
      }),
    );

    return scrapeAmazoneSearchWord;
  }

  private scrapeSearchWord(scraperRequest: ScraperRequest): Observable<any> {

    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);

    const scrapeAmazoneSearchWord = this.scraperAmazone
      .scrapeUrlHome(`${baseUrlAmazone}s?k=${scraperRequest.searchWord.replace(/\\s/g, '+').trim()}&i=garden`)
      .pipe(
        mergeMap(products => {
          this.logger.log(`number of products [${products.length}] `);
          return from(products);
        }),
        map(produit => {

          const produitClass: Product = plainToClass(Product, produit);
          produitClass.searchWord = scraperRequest.searchWord;
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
        mergeMap((produitClass: Product) => this.getProductDetail(produitClass, baseUrlAmazone, scraperRequest.idRequest)),

        mergeMap((produitClass: Product) => this.getProductReviews(produitClass, scraperRequest.idRequest),
        ),
      );

    return scrapeAmazoneSearchWord;
  }

  private getProductDetail = (produitClass: Product, baseUrlAmazone: string, idRequest: string = null): Observable<Product> => {
    const start = Date.now();
    this.logger.log(`find product asin [${produitClass.asin}]`, idRequest);

    return this.scraperAmazone.productDetail(produitClass.link, baseUrlAmazone).pipe(
      map((productDetail) => plainToClass(ProductDetail, productDetail)),
      mergeMap((productDetail: ProductDetail) => from(productDetail.isValideProduct()).pipe(
        // filter(Boolean),
        mapTo(productDetail),
      )),

      map((productDetail: ProductDetail) => {

        this.logger.log(`find productDetail asin [${produitClass.asin}]  in ${Date.now() - start}ms`, idRequest);
        produitClass.productDetail = productDetail;
        return produitClass;
      })

      ,
    );

  };

  private getProductReviews = (produitClass: Product, idRequest: string = null): Observable<Product> => {
    return of(produitClass.productDetail.linkReviews).pipe(
      filter((linkReviews) => linkReviews != null),
      mergeMap((linkReviews) => {
        const start = Date.now();
        return this.scraperAmazone.productReviews(linkReviews).pipe(
          map((productReviews) => plainToClass(ProductReviews, productReviews)),
          map((productReviews: ProductReviews) => {
            this.logger.log(`find productReviews asin [${produitClass.asin}] in ${Date.now() - start}ms`, idRequest);
            produitClass.productDetail.productReviews = productReviews;
            return produitClass;
          }),
        );
      }),
    );
  };

}

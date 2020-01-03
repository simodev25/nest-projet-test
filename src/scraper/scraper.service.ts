import { Injectable, OnModuleInit } from '@nestjs/common';
import { filter, map, mapTo, max, mergeMap, switchMap } from 'rxjs/operators';
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
import { LoggerServiceBase } from '../shared/logger/loggerService';
import { isNil } from '../shared/utils/shared.utils';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ConfigService } from '@nestjs/config';

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
                context: 'ScraperMicroService',
                prefix: 'ScraperService',
              }) private logger: LoggerServiceBase,
              private readonly productRepository: ProductRepository,
              private readonly scraperAmazone: ScraperAmazoneService,
              @InjectSchedule() private readonly schedule: Schedule,
              private readonly configService: ConfigService) {

  }

  private scrapeSearchWord$: Subscription = null;
  private scrapeKeyword$: Subject<boolean> = new Subject<boolean>();
  private jobScrape: { startTime?: number, endTime?: number, status: JobScrapeStatus } = { status: JobScrapeStatus.STOP };
  private keywords: Keywords = null;

  onModuleInit() {
    this.scrapeAmazone();
  }



  private scrapeAmazone() {

    let count: number = 0

    this.scrapeKeyword$.pipe(filter((hasNext: boolean) => {
      if (!isNil(this.scrapeSearchWord$)) {
        this.scrapeSearchWord$.unsubscribe();
      }
      if (hasNext === false) {
        this.jobScrape.status = JobScrapeStatus.STOP;
        this.jobScrape.endTime = Date.now();
        this.logger.debug(`number of ALL products  processed [${count}] scrapeAmazone end in  ${format(
          '%s %s %dms %s',
          '',
          'end .',
          Date.now() - this.jobScrape.startTime,
          '',
          '',
        )}`);
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
        this.logger.error(error);
        this.jobScrape.status = JobScrapeStatus.STOP;
        this.jobScrape.endTime = Date.now();
      }), () => {
        this.scrapeKeyword$.next(this.keywords.hasNext());
      });

    });

    this.scrapeJobStart();

  }

  public scrapeJobStart(): void {
    const KEYWORD_LIST = ['nintendoswitch', 'ps4', 'laptop', 'kindle', 'ssd', 'fidgetspinner', 'tablet', 'headphones', 'ipad', 'switch', 'fitbit', 'iphone', 'iphone7', 'tv', 'gameofthrones', 'lego', 'harrypotter', 'iphone6', 'alexa', 'books', 'bluetoothheadphones', 'monitor', 'iphonex', 'xboxone', 'externalharddrive', 'firestick', 'playstation4', 'instantpot', 'iphone6s', 'microsdcard', 'shoes', 'starwars', 'samsung', 'backpack', 'ps4pro', 'mouse', 'wirelessheadphones', 'drone', 'applewatch', 'smartwatch', 'echo', 'samsunggalaxys8', 'iphone8', 'powerbank', 'roku', 'keyboard', 'xiaomi', 'redmi4', 'gtx1060', 'redmi4a', 'gtx1070', 'airpods', 'bluetoothspeakers', 'ps4controller', 'gtx1080', 'ps4games', 'waterbottle', 'smartphone', 'gamingmouse', 'toiletpaper', 'earphones', 'camera', 'echodot', 'hdmicable', 'airfryer', 'laptops', 'gamingchair', 'wirelessmouse', 'huawei', 'kindlefire', 'doctorwho', 'amazon', 'printer', 'sdcard', 'gopro', 'xboxonecontroller', 'chromecast', 'xboxonex', 'desk', 'primevideo', 'vans', 'watch', 'pokemon', 'notebook', 'giftcard', 'iphone7plus', 'gamingpc', 'samsunggalaxys7', 'nike', 'popsocket', 'iphonecharger', 'officechair', 'windows10', 'anker', 'mousepad', 'iphone7case', 'iphonese', 'wirelessearbuds', 'earbuds', 'mobile'];

    this.keywords = new Keywords(KEYWORD_LIST);
    this.jobScrape.status = JobScrapeStatus.START;
    this.jobScrape.startTime = Date.now();
    this.scrapeKeyword$.next(this.keywords.hasNext());

  }

  public scrapeSearchWord(searchWord: string): Observable<number> {

    let productCount: number = 0;
    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);

    const scrapeAmazoneSearchWord = this.scraperAmazone
      .scrapeUrlHome(`${baseUrlAmazone}s?k=${searchWord.replace(/\\s/g, '+').trim()}&i=garden`)
      .pipe(
        switchMap(produit => from(produit)),
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
        map((produitClass: Product) => {
          productCount++;
          this.productRepository.saveProduct(produitClass).subscribe();
          return productCount;

        }),
        map(() => productCount),
        max(),
      );

    return scrapeAmazoneSearchWord;
  }

}

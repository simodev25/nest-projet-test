import { Injectable } from '@nestjs/common';
import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { ConfigService } from '@nestjs/config';
import { ScraperMerchantwordsService } from './lib/scraper.merchantwords.service';
import { map, max, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { plainToClass } from 'class-transformer';
import { ScraperHelper } from './ScraperHelper';
import { Merchantwords } from './product/merchantwords';
import { MerchantwordsRepository } from './schema/merchantwords.repository';
import { format } from 'util';

@Injectable()
export class MerchantwordsService {

  constructor(@Logger({
                context: 'scraperMicroService',
                prefix: 'scraperService',
              }) private logger: ScraperLoggerService,
              private readonly merchantwordsRepository: MerchantwordsRepository,
              private readonly scraperMerchantwordsService: ScraperMerchantwordsService,
              private readonly configService: ConfigService) {

  }

  public merchantwordsJobStart(): void {
    this.logger.log(`MerchantwordsJobStart`);
    let wordsCount: number = 0;
    const country: string = 'US';
    const endTime = Date.now();
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);
    const scrapeAmazoneSearchWord = this.scraperMerchantwordsService
      .scrapeUrlHome(`${this.configService.get('MERCHANTWORDS_URL')}${country.toLowerCase()}/*/sort-lowest`);
    scrapeAmazoneSearchWord.pipe(
      switchMap(searchWords => from(searchWords)),
      map((searchWord: any) => {

        const merchantword: Merchantwords = plainToClass(Merchantwords, searchWord);
        merchantword.country = country;
        merchantword.currency = ScraperHelper.getCurrency(country);
        merchantword.site = baseUrlAmazone;
        //  this.logger.debug(`plainToClass out :${searchWord.wordsSearch}`);
        return merchantword;
      }),
      mergeMap((merchantword: Merchantwords) => this.merchantwordsRepository.saveMerchantword(merchantword)),
      map((merchantword: Merchantwords) => {
        wordsCount++;

        return wordsCount;
      }),
      max(),
    )
      .subscribe(cordsCount => {
        this.logger.debug(`number of ALL products  processed [${cordsCount}] scrapeAmazone end in  ${format(
          '%s %s %dms %s',
          '',
          '',
          Date.now() - endTime,
          '',
          '',
        )}`);
        process.exit();
      }, (error) => {

        this.logger.error(error);
        process.exit(1);
      }, )
  }

  public getAllMerchantwords(): Observable<string[]> {

    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);
    return this.merchantwordsRepository.getAllMerchantwords(baseUrlAmazone).pipe(map((merchantwords: Merchantwords) => {
        return merchantwords.wordsSearch;
      }),
      toArray(),
    );
  }

  public getMerchantwords(): Observable<Merchantwords[]> {

    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);
    return this.merchantwordsRepository.getAllMerchantwords(baseUrlAmazone).pipe(map((merchantwords: Merchantwords) => {
        return merchantwords;
      }),
      toArray(),
    );
  }

}

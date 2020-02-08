import { Injectable } from '@nestjs/common';
import { Logger } from '../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { ProductRepository } from './schema/product.repository';
import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { ConfigService } from '@nestjs/config';
import { ScraperMerchantwordsService } from './lib/scraper.merchantwords.service';
import { map, max, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { Product } from './product/product';
import { plainToClass } from 'class-transformer';
import { ScraperHelper } from './ScraperHelper';
import { Merchantwords } from './product/merchantwords';
import { Exception } from '../shared/Exception/exception';
import { MerchantwordsRepository } from './schema/merchantwords.repository';

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

    let wordsCount: number = 0;
    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);
    const scrapeAmazoneSearchWord = this.scraperMerchantwordsService
      .scrapeUrlHome(`${this.configService.get('MERCHANTWORDS_URL')}${country.toLowerCase()}//sort-lowest`);
    scrapeAmazoneSearchWord.pipe(
      switchMap(searchWords => from(searchWords)),
      map(searchWord => {

        const merchantword: Merchantwords = plainToClass(Merchantwords, searchWord);
        merchantword.country = country;
        merchantword.currency = ScraperHelper.getCurrency(country);
        merchantword.site = baseUrlAmazone;
        return merchantword;
      }),

      map((merchantword: Merchantwords) => {
        wordsCount++;
        this.merchantwordsRepository.saveMerchantword(merchantword).subscribe(() => {
        }, (error => {
          throw new Exception(error);
        }));
        return wordsCount;

      }),
      max(),
    )
      .subscribe(console.log);
  }

}

import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';

import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { ProductEntity } from './schema/product.entity';
import { ProductRepository } from './schema/product.repository';
import { ProductDetailEntity } from './schema/productDetail.entity';
import { ProductReviewsEntity } from './schema/productReviews.entity';
import { ProductHistEntity } from './schema/product.hist.entity';
import { ProductHtmlEntity } from './schema/product.html.entity';
import { ScraperLoggerService } from '../shared/logger/loggerService';
import { SharedModule } from '../shared/shared.module';
import { ConfigService } from '@nestjs/config';
import { ScraperHelper } from './ScraperHelper';
import { ProxyService } from './lib/proxy.service';
import { MerchantwordsEntity } from './schema/merchantwords.entity';
import { MerchantwordsService } from './merchantwords.service';
import { ScraperMerchantwordsService } from './lib/scraper.merchantwords.service';
import { MerchantwordsRepository } from './schema/merchantwords.repository';

@Module({
  imports: [
    SharedModule.forRoot(),
    TypegooseModule.forFeature([
      ProductEntity, ProductDetailEntity, MerchantwordsEntity, ProductReviewsEntity, ProductHistEntity, ProductHtmlEntity]),

  ],
  providers: [ScraperAmazoneService, ScraperHelper, ScraperService, MerchantwordsRepository, ProductRepository, ScraperLoggerService, ConfigService, ProxyService, MerchantwordsService, ScraperMerchantwordsService],
  exports:[MerchantwordsService]
})
export class ScraperModule {
}

import { HttpModule, Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';

import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { ProductEntity } from './schema/product.entity';
import { ProductRepository } from './schema/product.repository';
import { ProductDetailEntity } from './schema/productDetail.entity';
import { ProductReviewsEntity } from './schema/productReviews.entity';
import { ProductHistEntity } from './schema/product.hist.entity';
import { ProductHtmlEntity } from './schema/product.html.entity';
import { CronModule } from 'nestjs-cron';
import { LoggerServiceBase } from '../shared/logger/loggerService';
import { SharedModule } from '../shared/shared.module';
import { ConfigService } from '@nestjs/config';
import { ScraperHelper } from './ScraperHelper';
import { ProxyService } from './lib/proxy.service';

@Module({
  imports: [
    SharedModule.forRoot(),
    TypegooseModule.forFeature([
      ProductEntity, ProductDetailEntity, ProductReviewsEntity, ProductHistEntity, ProductHtmlEntity]),

    CronModule.forRoot()],
  providers: [ScraperAmazoneService, ScraperHelper, ScraperService, ProductRepository, LoggerServiceBase, ConfigService,ProxyService],
})
export class ScraperModule {
}

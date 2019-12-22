import { HttpModule, Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { NestCrawlerModule } from 'nest-crawler/dist';

import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ProductEntity } from './schema/product.entity';
import { ProductRepository } from './schema/product.repository';
import { ProductDetailEntity } from './schema/productDetail.entity';
import { ProductDetailRepository } from './schema/productDetail.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      useNewUrlParser: true,
      useUnifiedTopology: true,
      logging: ["query", "error"],
      type: 'mongodb',
      url:
        'mongodb://localhost/scraper',
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
      synchronize: false,
      // useNewUrlParser: true,

    }),
    TypeOrmModule.forFeature([ProductEntity, ProductDetailEntity]),
    HttpModule, NestCrawlerModule],
  providers: [ScraperAmazoneService, ScraperService, ProductRepository, ProductDetailRepository],
})
export class ScraperModule {
}

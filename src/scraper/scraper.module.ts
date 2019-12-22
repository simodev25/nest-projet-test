import { HttpModule, Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';

import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { join } from 'path';
import { ProductEntity } from './schema/product.entity';
import { ProductRepository } from './schema/product.repository';
import { ProductDetailEntity } from './schema/productDetail.entity';
import { ProductDetailRepository } from './schema/productDetail.repository';
import { ProductReviewsEntity } from './schema/productReviews.entity';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { SchemaOptions } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

const optionsTypegoose = {

  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  /* autoIndex: true, // Don't build indexes
   reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
   reconnectInterval: 500, // Reconnect every 500ms
   poolSize: 10, // Maintain up to 10 socket connections
   // If not connected, return errors immediately rather than waiting for reconnect
   bufferMaxEntries: 0,
   connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
   useUnifiedTopology: false,*/

};

@Module({
  imports: [
    TypegooseModule.forRoot('mongodb://localhost/scraper?retryWrites=true&w=majority', optionsTypegoose),
    TypegooseModule.forFeature([{
      typegooseClass: ProductEntity,
      schemaOptions: { timestamps: true },
    },
      {
        typegooseClass: ProductDetailEntity,
        schemaOptions: { timestamps: true },
      },
      {
        typegooseClass: ProductReviewsEntity,
        schemaOptions: { timestamps: true },
      }]),
    HttpModule],
  providers: [ScraperAmazoneService, ScraperService, ProductRepository],
})
export class ScraperModule {
}

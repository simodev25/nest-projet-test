import { Injectable } from '@nestjs/common';
import { Logger } from '../../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../../shared/logger/loggerService';
import { ConfigService } from '@nestjs/config';
import { Product } from '../product/product';
import { from, Observable } from 'rxjs';
import { Merchantwords } from '../product/merchantwords';
import { InjectModel } from 'nestjs-typegoose';
import { ProductEntity } from './product.entity';
import { ReturnModelType } from '@typegoose/typegoose';
import { MerchantwordsEntity } from './merchantwords.entity';
import { classToPlain, plainToClass } from 'class-transformer';

@Injectable()
export class MerchantwordsRepository {
  constructor(
    @Logger({
      context: 'scraperMicroService',
      prefix: 'productRepository',
    }) private logger: ScraperLoggerService,
    private readonly configService: ConfigService,
    @InjectModel(MerchantwordsEntity) private readonly merchantwordsEntityModel: ReturnModelType<typeof MerchantwordsEntity>,
  ) {

  }

  public saveMerchantword(merchantwords: Merchantwords): Observable<any> {
    const serializedMerchantwords = classToPlain(merchantwords);
    const merchantwordsEntity: MerchantwordsEntity = plainToClass(MerchantwordsEntity, serializedMerchantwords);
    const merchantwordsModel = new this.merchantwordsEntityModel(merchantwordsEntity);

    return from(merchantwordsModel.save());
  }
}

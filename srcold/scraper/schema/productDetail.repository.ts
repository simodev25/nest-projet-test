import { EntityRepository, MongoRepository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductDetailEntity } from './productDetail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/product';
import { from, Observable } from 'rxjs';
import { classToPlain, plainToClass } from 'class-transformer';
import { ProductDetail } from '../product/productDetail';

import { ReturnModelType } from '@typegoose/typegoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { tap } from 'rxjs/operators';
@Injectable()
export class ProductDetailRepository  {
  constructor(
    @InjectModel(ProductDetailEntity) private readonly productDetailEntityModel: ReturnModelType<typeof ProductDetailEntity>,
  ) {
  }

  public saveProductDetail(productDetail: ProductDetail): Observable<ProductDetailEntity> {

    const serializedProduct = classToPlain(productDetail);
    const productEntityDto: ProductDetailEntity = plainToClass(ProductDetailEntity, serializedProduct);

    const productDetailEntity = new this.productDetailEntityModel(productEntityDto);
    return from(productDetailEntity.save());
  }
}

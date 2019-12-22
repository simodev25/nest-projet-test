import { EntityRepository, MongoRepository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductDetailEntity } from './productDetail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/product';
import { from, Observable } from 'rxjs';
import { classToPlain, plainToClass } from 'class-transformer';
import { ProductDetail } from '../product/productDetail';

@EntityRepository(ProductDetailEntity)
export class ProductDetailRepository extends MongoRepository<ProductDetailEntity> {


  public saveProductDetail(productDetail: ProductDetail): Observable<ProductDetailEntity> {

    const serializedProduct = classToPlain(productDetail);
    const productDetailEntity: ProductDetailEntity = plainToClass(ProductDetailEntity, serializedProduct);

    return from(productDetailEntity.save());
  }
}

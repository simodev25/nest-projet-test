import { EntityRepository, MongoRepository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { Product } from '../product/product';
import { classToPlain, plainToClass } from 'class-transformer';
import { from, Observable } from 'rxjs';
import { ProductDetailEntity } from './productDetail.entity';

@EntityRepository(ProductEntity)
export class ProductRepository extends MongoRepository<ProductEntity> {

  public saveProduct(product: Product): Observable<ProductEntity> {

    const serializedProduct = classToPlain(product);
    const productEntity: ProductEntity = plainToClass(ProductEntity, serializedProduct);
    const serializedProductDetail = classToPlain(product.productDetail);
    const productDetailEntity: ProductDetailEntity = plainToClass(ProductDetailEntity, serializedProductDetail);
    productEntity.productDetail = productDetailEntity;
    return from(productEntity.save());
  }

}

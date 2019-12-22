import { ProductEntity } from './product.entity';
import { Product } from '../product/product';
import { classToPlain, plainToClass } from 'class-transformer';
import { forkJoin, from, merge, Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from 'typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { ProductDetailEntity } from './productDetail.entity';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { ProductReviewsEntity } from './productReviews.entity';
import { isNil } from '../../shared/utils/shared.utils';


@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(ProductEntity) private readonly productEntityModel: ReturnModelType<typeof ProductEntity>,
    @InjectModel(ProductDetailEntity) private readonly productDetailEntityModel: ReturnModelType<typeof ProductDetailEntity>,
    @InjectModel(ProductReviewsEntity) private readonly productReviewsEntityModel: ReturnModelType<typeof ProductReviewsEntity>,
  ) {
  }

  public saveProduct(product: Product): Observable<any> {

    const serializedProduct = classToPlain(product);
    const serializedProductDetail = classToPlain(product.productDetail);
    const serializedProductReviews = classToPlain(product.productDetail.productReviews);
    const productEntityDto: ProductEntity = plainToClass(ProductEntity, serializedProduct);
    const productEntity = new this.productEntityModel(productEntityDto);

    const productDetailEntityDto: ProductDetailEntity = plainToClass(ProductDetailEntity, serializedProductDetail);
    const productDetailEntity = new this.productDetailEntityModel(productDetailEntityDto);
    productEntity.productDetail = productDetailEntity;

    const productReviewsEntityDto: ProductReviewsEntity = plainToClass(ProductReviewsEntity, serializedProductReviews);
    const productReviewsEntity = new this.productReviewsEntityModel(productReviewsEntityDto);

    productEntity.productDetail.productReviews = productReviewsEntity;

    return this.saveOrUpdateProduct(productEntity, productDetailEntity, productReviewsEntity);

  }

  public saveOrUpdateProduct(productEntityDto: DocumentType<ProductEntity>, productDetailEntity: DocumentType<ProductDetailEntity>, productReviewsEntity: DocumentType<ProductReviewsEntity>): Observable<any> {
    const source$ = from(this.productEntityModel.findOne({ asin: productEntityDto.asin }));
    const save$ = source$.pipe(
      filter((productEntityfind: DocumentType<ProductEntity>) => isNil(productEntityfind)),
      map((productEntityfind: DocumentType<ProductEntity>) => {

        console.log(`save product : id :[${productEntityDto._id}] `);
        return productEntityDto;
      }),
      mergeMap((productEntity: DocumentType<ProductEntity>) => {

        return forkJoin(
          {
            productEntity: productEntity.save(),
            productDetailEntity: productDetailEntity.save(),
            productReviews: from(productReviewsEntity.save()),
          });

      }));
    //  let updateProductDetail$ = null;
    const updateProduct$ = source$.pipe(
      filter((productEntityfind: DocumentType<ProductEntity>) => !isNil(productEntityfind)),
      tap((productEntityfind: DocumentType<ProductEntity>) => {
        this.updateProductDetail$(productEntityfind, productDetailEntity, productReviewsEntity).subscribe();
      }),
      map((productEntityfind: DocumentType<ProductEntity>) => {
        const productEntityFindserialized: ProductEntity = productEntityfind.toJSON() as ProductEntity;
        const productEntityDtoUpdate: DocumentType<ProductEntity> = Object.assign(productEntityfind,
          plainToClass(ProductEntity, productEntityDto.toJSON(), { excludeExtraneousValues: true })) as DocumentType<ProductEntity>;

        return productEntityDtoUpdate.equals(productEntityFindserialized as ProductEntity) ? null : productEntityDtoUpdate;
      }),
      filter((productEntityDtoUpdate: DocumentType<ProductEntity>) => !isNil(productEntityDtoUpdate)),
      mergeMap((productEntityDtoUpdate: DocumentType<ProductEntity>) => {
        console.log(`update product : id :[${productEntityDtoUpdate.id}] `);

        return from(productEntityDtoUpdate.save());
      }));

    const saveOrUpdate$ = merge(
      save$,
      updateProduct$,
    );
    return saveOrUpdate$;
  }

  private updateProductDetail$(productEntityfind: DocumentType<ProductEntity>,
                               productDetailEntity: DocumentType<ProductDetailEntity>,
                               productReviewsEntity: DocumentType<ProductReviewsEntity>) {
    return from(this.productDetailEntityModel.findById((productEntityfind.productDetail as ProductDetailEntity)._id))
      .pipe(
        tap((productDetailEntityfind: DocumentType<ProductDetailEntity>) => {
          this.updateProductReviews$(productDetailEntityfind, productReviewsEntity).subscribe();
        }),
        map((productDetailEntityfind: DocumentType<ProductDetailEntity>) => {
          const productDetailFindserialized: ProductDetailEntity = productDetailEntityfind.toJSON() as ProductDetailEntity;
          const productDetailtEntityDtoUpdate: DocumentType<ProductDetailEntity> = Object.assign(productDetailEntityfind,
            plainToClass(ProductDetailEntity, productDetailEntity.toJSON(), { excludeExtraneousValues: true })) as DocumentType<ProductDetailEntity>;
          return productDetailtEntityDtoUpdate.equals(productDetailFindserialized) ? null : productDetailtEntityDtoUpdate;
        }),
        filter((productDetailtEntityDtoUpdate: DocumentType<ProductDetailEntity>) => !isNil(productDetailtEntityDtoUpdate)),
        mergeMap((productDetailtEntityDtoUpdate: DocumentType<ProductDetailEntity>) => {
          console.log(`update productDetailt : id :[${productDetailtEntityDtoUpdate.id}] `);

          return from(productDetailtEntityDtoUpdate.save());
        }),
      );
  }

  private updateProductReviews$(productDetailEntityfind: DocumentType<ProductDetailEntity>,
                                productReviewsEntity: DocumentType<ProductReviewsEntity>) {

    return from(this.productReviewsEntityModel.findById((productDetailEntityfind.productReviews as ProductReviewsEntity)._id))
      .pipe(
        map((productReviewsEntityfind: DocumentType<ProductReviewsEntity>) => {
          const productReviewsFindserialized: ProductReviewsEntity = productReviewsEntityfind.toJSON() as ProductReviewsEntity;
          const productReviewsEntityDtoUpdate: DocumentType<ProductReviewsEntity> = Object.assign(productReviewsEntityfind,
            plainToClass(ProductReviewsEntity, productReviewsEntity.toJSON(), { excludeExtraneousValues: true })) as DocumentType<ProductReviewsEntity>;
          return productReviewsEntityDtoUpdate.equals(productReviewsFindserialized) ? null : productReviewsEntityDtoUpdate;
        }),
        filter((productReviewsEntityDtoUpdate: DocumentType<ProductReviewsEntity>) => !isNil(productReviewsEntityDtoUpdate)),
        mergeMap((productReviewsEntityDtoUpdate: DocumentType<ProductReviewsEntity>) => {
          console.log(`update productReviews : id :[${productReviewsEntityDtoUpdate.id}] `);

          return from(productReviewsEntityDtoUpdate.save());
        }),
      );
  }

}

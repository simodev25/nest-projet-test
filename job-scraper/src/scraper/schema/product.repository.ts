import { ProductEntity } from './product.entity';
import { Product } from '../product/product';
import { classToPlain, plainToClass } from 'class-transformer';
import { forkJoin, from, merge, Observable, pipe } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';

import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { ProductDetailEntity } from './productDetail.entity';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { ProductReviewsEntity } from './productReviews.entity';
import { isNil } from '../../shared/utils/shared.utils';

import { ProductHistEntity } from './product.hist.entity';
import { ProductHtmlEntity } from './product.html.entity';
import { Logger } from '../../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../../shared/logger/loggerService';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductRepository {
  constructor(
    @Logger({
      context: 'scraperMicroService',
      prefix: 'productRepository',
    }) private logger: ScraperLoggerService,
    private readonly configService: ConfigService,
    @InjectModel(ProductEntity) private readonly productEntityModel: ReturnModelType<typeof ProductEntity>,
    @InjectModel(ProductDetailEntity) private readonly productDetailEntityModel: ReturnModelType<typeof ProductDetailEntity>,
    @InjectModel(ProductReviewsEntity) private readonly productReviewsEntityModel: ReturnModelType<typeof ProductReviewsEntity>,
    @InjectModel(ProductHistEntity) private readonly productHistEntityEntityModel: ReturnModelType<typeof ProductHistEntity>,
    @InjectModel(ProductHtmlEntity) private readonly productHtmlEntityModel: ReturnModelType<typeof ProductHtmlEntity>,
  ) {
  }

  public saveProduct(product: Product): Observable<any> {

    const serializedProduct = classToPlain(product);
    // console.log(product.productDetail.sourceHtml)
    const serializedProductDetail = classToPlain(product.productDetail);
    const serializedProductReviews = classToPlain(product.productDetail.productReviews);
    const productEntityDto: ProductEntity = plainToClass(ProductEntity, serializedProduct);
    const productEntityModel = new this.productEntityModel(productEntityDto);

    const productDetailEntityDto: ProductDetailEntity = plainToClass(ProductDetailEntity, serializedProductDetail);
    const productDetailEntity = new this.productDetailEntityModel(productDetailEntityDto);

    //   const productHtmlEntity: ProductHtmlEntity = new ProductHtmlEntity();
    // productHtmlEntity.sourceHtml = product.productDetail.sourceHtml;
    //productDetailEntity.productHtmlSource =  new this.productHtmlEntityModel(productHtmlEntity);
    productEntityModel.productDetail = productDetailEntity;

    const productReviewsEntityDto: ProductReviewsEntity = plainToClass(ProductReviewsEntity, serializedProductReviews);
    const productReviewsEntity = new this.productReviewsEntityModel(productReviewsEntityDto);

    productEntityModel.productDetail.productReviews = productReviewsEntity;

    return this.saveOrUpdateProduct(productEntityModel, productDetailEntity, productReviewsEntity);

  }

  public saveOrUpdateProduct(productEntityModel: DocumentType<ProductEntity>, productDetailEntity: DocumentType<ProductDetailEntity>, productReviewsEntity: DocumentType<ProductReviewsEntity>): Observable<any> {
    const source$ = from(this.productEntityModel.findOne({ asin: productEntityModel.asin }));
    const save$ = source$.pipe(
      filter((productEntityfind: DocumentType<ProductEntity>) => isNil(productEntityfind)),
      map((productEntityfind: DocumentType<ProductEntity>) => {
        this.logger.log(`save product : id :[${productEntityModel.id}]  asin :[${productEntityModel.asin}]`);

        return productEntityModel;
      }),
      mergeMap((productEntityModel$: DocumentType<ProductEntity>) => {

        return forkJoin(
          {
            productEntity: from(productEntityModel$.save()),
            productDetailEntity: from(productDetailEntity.save()),
            //     productHtmlSource: from((productDetailEntity.productHtmlSource as DocumentType<ProductHtmlEntity>).save()),
            productReviews: from(productReviewsEntity.save()),
          });

      }));
    const updateProduct$ = source$.pipe(
      filter((productEntityfind: DocumentType<ProductEntity>) => !isNil(productEntityfind)),
      mergeMap((productEntityfind$: DocumentType<ProductEntity>) => {
        return this.updateProductDetail$(productEntityfind$, productDetailEntity, productReviewsEntity);
      }),
      map((productEntityfind$: DocumentType<ProductEntity>) => {
        const productEntityFindserialized: ProductEntity = productEntityfind$.toJSON() as ProductEntity;
        const productEntityDtoUpdate: DocumentType<ProductEntity> = Object.assign(productEntityfind$,
          plainToClass(ProductEntity, productEntityModel.toJSON(), { excludeExtraneousValues: true })) as DocumentType<ProductEntity>;

        return productEntityDtoUpdate.equals(productEntityFindserialized as ProductEntity) ? null : productEntityDtoUpdate;
      }),
      filter((productEntityDtoUpdate: DocumentType<ProductEntity>) => !isNil(productEntityDtoUpdate)),
      mergeMap((productEntityDtoUpdate: DocumentType<ProductEntity>) => {
        this.logger.log(`update product : id :[${productEntityDtoUpdate.id}] asin :[${productEntityDtoUpdate.asin}] `);
        return from(productEntityDtoUpdate.save()).pipe(
          mergeMap((productEntityDtoUpdate$: DocumentType<ProductEntity>) => {

            const productHistEntityDTO: ProductHistEntity = new ProductHistEntity();
            productHistEntityDTO.asin = productEntityDtoUpdate$.asin;
            productHistEntityDTO.price = productEntityDtoUpdate$.price;
            productHistEntityDTO.reviews = productEntityDtoUpdate$.reviews;
            productHistEntityDTO.rating = productEntityDtoUpdate$.rating;

            productHistEntityDTO.priceMin = productDetailEntity.priceMin;
            productHistEntityDTO.priceMax = productDetailEntity.priceMax;

            const productHistEntity: DocumentType<ProductHistEntity> = new this.productHistEntityEntityModel(productHistEntityDTO);
            return this.saveHistotiqueProduit(productHistEntity);
          }),
        );
      }));

    const saveOrUpdate$ = merge(
      save$,
      updateProduct$,
    );
    return saveOrUpdate$;
  }

  private updateProductDetail$(productEntityfind: DocumentType<ProductEntity>,
                               productDetailEntity: DocumentType<ProductDetailEntity>,
                               productReviewsEntity: DocumentType<ProductReviewsEntity>): Observable<ProductEntity> {
    return from(this.productDetailEntityModel.findById((productEntityfind.productDetail as ProductDetailEntity)._id))
      .pipe(
        filter((productDetailEntityfind: DocumentType<ProductDetailEntity>) => !isNil(productDetailEntityfind)),
        mergeMap((productDetailEntityfind: DocumentType<ProductDetailEntity>) => {
          return this.updateProductReviews$(productDetailEntityfind, productReviewsEntity).pipe(filter((data) => !isNil(productDetailEntityfind.productReviews))).pipe(map(()=>productDetailEntityfind));
        }),
        map((productDetailEntityfind: DocumentType<ProductDetailEntity>) => {
          const productDetailFindserialized: ProductDetailEntity = productDetailEntityfind.toJSON() as ProductDetailEntity;
          const productDetailtEntityDtoUpdate: DocumentType<ProductDetailEntity> = Object.assign(productDetailEntityfind,
            plainToClass(ProductDetailEntity, productDetailEntity.toJSON(), { excludeExtraneousValues: true })) as DocumentType<ProductDetailEntity>;
          return productDetailtEntityDtoUpdate.equals(productDetailFindserialized) ? null : productDetailtEntityDtoUpdate;
        }),
        filter((productDetailtEntityDtoUpdate: DocumentType<ProductDetailEntity>) => !isNil(productDetailtEntityDtoUpdate)),
        mergeMap((productDetailtEntityDtoUpdate: DocumentType<ProductDetailEntity>) => {
          this.logger.log(`update productDetailt : id :[${productDetailtEntityDtoUpdate.id}]  asin :[${productEntityfind.asin}]`);

          return from(productDetailtEntityDtoUpdate.save()).pipe(map(() => productEntityfind));
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
          this.logger.log(`update productReviews : id :[${productReviewsEntityDtoUpdate.id}]`);

          return from(productReviewsEntityDtoUpdate.save());
        }),
      );
  }

  private saveHistotiqueProduit(productHistEntity: DocumentType<ProductHistEntity>) {

    return from(productHistEntity.save());
  }
}

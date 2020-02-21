import { BaseEntity, Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { IratingProduct, IreviewProduct } from '../product/product.interface';
import { modelOptions, pre, prop } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';
import { Expose } from 'class-transformer';

@pre<ProductReviewsEntity>('save', function(next) {
  this.increment();

  return next();
})

@pre<ProductReviewsEntity>('update', function(next) {
  this.update({}, { $inc: { __v: 1 } }, next);
})

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
@Expose()
export class ProductReviewsEntity {

  _id: string;
  @prop({ type: mongoose.Schema.Types.Number })
  @Expose()
  reviews: number;
  @prop({ type: mongoose.Schema.Types.Number })
  @Expose()
  rating: string;
  @prop()
  @Expose()
  ratings: IratingProduct[];
  @prop()
  @Expose()
  topCritical: IreviewProduct;
  @prop()
  @Expose()
  topPositive: IreviewProduct;
  @prop()
  reviewsContent: IreviewProduct[];

  public equals(product: ProductReviewsEntity) {

    return this.reviews === product.reviews
      && this.reviews === product.reviews
      && JSON.stringify(product.ratings) === JSON.stringify(this.ratings)
      && JSON.stringify(product.topCritical) === JSON.stringify(this.topCritical)
      && JSON.stringify(product.topPositive) === JSON.stringify(this.topPositive)
      ;

  }

}

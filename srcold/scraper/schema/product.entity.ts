import { pre, prop, Ref, modelOptions } from '@typegoose/typegoose';
import { ProductDetailEntity } from './productDetail.entity';
import { IsMongoId, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';
import { plugin } from 'typegoose';
import { Schema } from 'mongoose';

const mongooseHistory = require('mongoose-history');
const options = { customCollectionName: 'product_hist' };


@pre<ProductEntity>('save', function(next) {
  this.increment();
  return next();
})

@pre<ProductEntity>('update', function(next) {
  this.update({}, { $inc: { __v: 1 } }, next);
})

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
@plugin(mongooseHistory, options)
export class ProductEntity {
  @IsOptional()
  @IsMongoId()
  _id: string;

  @prop({
    type: String,
    required: [true, 'Please add an asin'],
    unique: true,
    index: true,

  })
  asin: string;
  @prop()
  searchWord: string;
  @prop()
  currency: string;
  @prop({
    type: String,
    required: true,
    index: true,

  })
  manufacturer: string;
  @prop({
    type: String,
    required: true,
    index: true,

  })
  @Expose()
  title: string;
  @prop()
  @Expose()
  image: string;
  @prop()
  link: string;
  @prop()
  @Expose()
  reviews: number;
  @prop()
  @Expose()
  rating: number;
  @prop({
    type: Number,
    required: true,
    index: true,

  })
  @Expose()
  price: number;
  @prop()
  shipping: string;

  @prop({ ref: ProductDetailEntity, required: true })
  productDetail: Ref<ProductDetailEntity>;

  public equals(product: ProductEntity) {

    return this.title === product.title
      && this.price === product.price
      && this.image === product.image
      && this.reviews === product.reviews
      && this.rating === product.rating
      ;

  }

}

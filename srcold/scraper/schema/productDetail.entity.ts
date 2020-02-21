import { ProductReviewsEntity } from './productReviews.entity';
import { modelOptions, mongoose, plugin, pre, prop, Ref } from '@typegoose/typegoose';
import { Expose } from 'class-transformer';
import { Schema } from 'mongoose';
import { ProductHtmlEntity } from './product.html.entity';
import * as autopopulate from "mongoose-autopopulate";

@plugin(autopopulate)
export class ProductDetailEntity {

  _id: string;
  @prop({ index: true })
  manufacturer: string;
  @prop()
  @Expose()
  productTitle: string;
  @prop({ type: mongoose.Schema.Types.Number })
  @Expose()
  customerRatings: number;
  @prop({ type: mongoose.Schema.Types.Number })
  @Expose()
  answeredQuestions: number;
  @prop({ type: mongoose.Schema.Types.Number })
  @Expose()
  crossedPrice: number;
  @prop()
  link: string;
  @prop()
  @Expose()
  price: string;
  @prop()
  @Expose()
  price01: string;
  @prop()
  @Expose()
  price02: string;
  @prop()
  priceMin: number;
  @prop()
  priceMax: number;
  @prop()
  images: string[];
  @prop()
  linkReviews: string;
  @prop()
  @Expose()
  rating: number;
  @prop({ ref: ProductReviewsEntity, required: true, autopopulate: true })
  productReviews?: Ref<ProductReviewsEntity>;
  @prop({ ref: ProductHtmlEntity, required: false, autopopulate: true, type: Schema.Types.ObjectId })
  productHtmlSource: Ref<ProductHtmlEntity>;

  public equals(productDetail: ProductDetailEntity) {

    return this.productTitle === productDetail.productTitle
      && this.price === productDetail.price
      && this.crossedPrice === productDetail.crossedPrice
      && this.price01 === productDetail.price01
      && this.price02 === productDetail.price02
      && this.rating === productDetail.rating
      && this.customerRatings === productDetail.customerRatings
      && this.answeredQuestions === productDetail.answeredQuestions
      ;

  }
}


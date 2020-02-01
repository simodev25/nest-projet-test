import { IsMongoId, IsOptional } from 'class-validator';
import { modelOptions, prop } from '@typegoose/typegoose';



@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class ProductHistEntity {
  @IsOptional()
  @IsMongoId()
  _id: string;
  @prop({
    type: String,
    required: [true, 'Please add an asin'],
    index: true,

  })
  asin: string;
  @prop({
    type: Number,
    required: true,
    index: true,

  })
  price: number;
  @prop({
    type: Number,
    required: false,
    index: true,

  })
  priceMin: number;
  @prop({
    type: Number,
    required: false,
    index: true,

  })
  priceMax: number;

  @prop({
    type: Number,
    required: false,
    index: true,

  })
  reviews: number;
  @prop({
    type: Number,
    required: false,
    index: true,

  })
  rating: number;

}

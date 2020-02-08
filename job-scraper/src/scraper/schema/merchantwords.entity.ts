import { modelOptions, pre, prop } from '@typegoose/typegoose';
import { IsMongoId } from 'class-validator';

@pre<MerchantwordsEntity>('save', function(next) {
  this.increment();
  return next();
})

@pre<MerchantwordsEntity>('update', function(next) {
  this.update({}, { $inc: { __v: 1 } }, next);
})

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class MerchantwordsEntity {

  @IsMongoId()
  _id: string;
  @prop()
  site: string;
  @prop()
  keywords: string;
  @prop()
  vollume: number;
  @prop()
  categories: string[];

}

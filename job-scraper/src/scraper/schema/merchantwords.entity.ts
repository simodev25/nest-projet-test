import { modelOptions, pre, prop } from '@typegoose/typegoose';
import { IsMongoId } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

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
  @Expose()
  @prop({ index: true })
  site: string;
  @prop({ index: true })
  @Expose()
  wordsSearch: string;
  @prop()
  @Expose()
  vollume: number;
  @prop()
  @Expose()
  categories: string[];

}

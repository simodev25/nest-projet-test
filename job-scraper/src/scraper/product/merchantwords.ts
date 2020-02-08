import { prop } from '@typegoose/typegoose';
import { Expose } from 'class-transformer';

export class Merchantwords {
  @Expose()
  site: string;
  @Expose()
  wordsSearch: string;
  @Expose()
  currency: string;
  @Expose()
  country: string;
  @Expose()
  vollume: number;
  @Expose()
  categories: string[];
}

import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Merchantwords {
  @Expose()
  @ApiProperty()
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

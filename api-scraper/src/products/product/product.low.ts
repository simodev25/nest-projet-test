import { ApiProperty } from '@nestjs/swagger';

export class ProductLow {
  @ApiProperty()
  baseUrl: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  site: string;
  @ApiProperty()
  asin: string;
  @ApiProperty()
  searchWord: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  price: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  link: string;
  @ApiProperty()
  reviews: string;
  @ApiProperty()
  rating: string;
}

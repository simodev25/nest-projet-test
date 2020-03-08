import { ApiProperty } from '@nestjs/swagger';

export class ImageProduct {
  @ApiProperty()
  image: string;
  @ApiProperty()
  size: string;
}

export class RatingProduct {
  @ApiProperty()
  name: string;
  @ApiProperty()
  value: string;
}

export class ReviewProduct {
  @ApiProperty()
  date: Date;
  @ApiProperty()
  text: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class FindAsin {
  @IsString()
  @IsNotEmpty()
  asin: string;
}

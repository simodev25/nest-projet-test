import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindAsin {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'asin  docs:https://www.amazon.fr/gp/help/customer/display.html?nodeId=201889580',
    type: String,
  })
  asin: string;
}

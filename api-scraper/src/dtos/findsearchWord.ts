import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindSearchWord {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Search word',
    type: String,
  })
  searchWord: string;
}

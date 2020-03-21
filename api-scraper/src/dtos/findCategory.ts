import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindCategory {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'list Categorys  /api/v1/categorys' ,
    type: String,
  })
  category: string;
}

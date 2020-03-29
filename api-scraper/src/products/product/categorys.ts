import { ApiProperty } from '@nestjs/swagger';

export class Categorys {
  @ApiProperty()
  name: string;
  @ApiProperty()
  id: string;
}

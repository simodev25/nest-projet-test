import { ApiProperty } from '@nestjs/swagger';

export class Errors {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  error: string;
  @ApiProperty()
  message: string;
}

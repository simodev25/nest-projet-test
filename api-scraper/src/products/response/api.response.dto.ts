import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Product } from '../product/product';
import { ApiRequestDto } from './api.request.dto';
import { StatusResponse } from '../../shared/enums/statusResponse';
import { Errors } from './errors';


export class ApiResponseDto {
  @ApiProperty({
    description: 'status',
    type: String,
  })
  status: string;
  @ApiProperty({
    description: 'request logs',
    type: ApiRequestDto,
    required: false,
  })
  request: ApiRequestDto;
  @ApiProperty({
    description: 'errors',
    required: false,
    type: Errors,
  })
  errors: Errors;

  @ApiProperty({
    description: 'Product items',
    type: Product,
    isArray: true,
    required: false,
  })
  products: Product[];


  constructor(arg: Product[] | ApiRequestDto) {

    if (arg instanceof Array) {
      this.status = StatusResponse.COMPLETED;
      this.products = arg as Product[];
    } else if (arg instanceof ApiRequestDto) {
      this.status = StatusResponse.STARTED;
      this.request = arg as ApiRequestDto;
    } else {
      this.status = StatusResponse.FAILED;
      this.errors = arg;
    }

  }
}

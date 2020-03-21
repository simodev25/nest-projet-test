import { Controller, Get, HttpStatus, Req, UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CacheInterceptor } from '../shared/cache/cache.interceptor';
import { Observable } from 'rxjs';

@Controller('/categorys')
@ApiResponse({ status: HttpStatus.OK, description: 'ok' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
export class CategorysController {
  constructor(private readonly productsService: ProductsService) {

  }
  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiTags('categorys')
  scrapeCategorys(@Req() req): Observable<any> {


    return this.productsService.scrapeCategorys();
  }

}

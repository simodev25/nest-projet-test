import { Controller, Get, Header, HttpStatus, Param, Req, Res, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FindIdRequest } from '../dtos/findIdRequest';
import { FindAsin } from '../dtos/findAsin';
import { CacheInterceptor } from '../shared/cache/cache.interceptor';
import { Observable } from 'rxjs';
import { FindSearchWord } from '../dtos/findsearchWord';
import { Product } from './product/product';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from './response/api.response.dto';
import { ProductLow } from './product/product.low';


@Controller('/products')
@ApiResponse({ status: HttpStatus.OK, description: 'ok' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
export class ProductsController {

  constructor(private readonly productsService: ProductsService) {


  }

  @Get('/searchword-low/:searchWord')
  @UseInterceptors(CacheInterceptor)
  @ApiTags('products')
  scrapeSearchWordLite(@Req() req, @Param() params: FindSearchWord): Observable<ProductLow[]> {


    return this.productsService.scrapeSearchWordLite(params.searchWord);
  }

  @Get('/searchword/:searchWord')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiTags('products')
  scrapeSearchWordAsync(@Req() req, @Param() params: FindSearchWord): Observable<ApiResponseDto> {

    return this.productsService.scrapeSearchWordAsync(params.searchWord);
  }

  @Get('/searchword-responses/:idRequest')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiTags('products')
  scrapeSearchWordAsyncResponse(@Req() req, @Param() params: FindIdRequest): Observable<ApiResponseDto> {

    return this.productsService.scrapeResponse(params.idRequest);

  }

  @Get('/asin/:asin')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiTags('products')
  scrapeByAsin(@Req() req, @Param() params: FindAsin): Observable<ApiResponseDto> {

    return this.productsService.scrapeByAsin(params.asin);

  }

  @Get('/asin-responses/:idRequest')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiTags('products')
  scrapeByAsinResponse(@Req() req, @Param() params: FindIdRequest): Observable<ApiResponseDto> {

    return this.productsService.scrapeResponse(params.idRequest);

  }


}

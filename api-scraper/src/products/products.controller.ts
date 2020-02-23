import { BadRequestException, Controller, Get, Header, Param, Req, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Response } from 'express';
import { FindIdRequest } from '../dtos/findIdRequest';
import { FindAsin } from '../dtos/findAsin';


@Controller('/products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) {


  }

  @Get('lite/:searchWord')
  @Header('Content-Type', 'application/json; charset=utf-8')
  scrapeSearchWordLite(@Req() req, @Param('searchWord') searchWord: string) {

    return this.productsService.scrapeSearchWordLite(searchWord);

  }

  @Get('/searchword/:searchWord')
  @Header('Content-Type', 'application/json; charset=utf-8')
  scrapeSearchWordAsync(@Res() reply: Response,@Req() req, @Param('searchWord') searchWord: string): any {

     this.productsService.scrapeSearchWordAsync(searchWord).subscribe((response$: any) => {

        reply.send(response$);

      }, error => {
        reply.send(error);
      },
    );

  }

  @Get('/searchword-responses/:idRequest')
  @Header('Content-Type', 'application/json; charset=utf-8')
  scrapeSearchWordAsyncResponse(@Res() reply: Response, @Req() req, @Param() params: FindIdRequest) {

    this.productsService.scrapeResponse(params.idRequest).subscribe((response$: any) => {

        reply.send(response$);

      }, error => {
        reply.send(error);
      },
    );

  }

  @Get('/asin/:asin')
  @Header('Content-Type', 'application/json; charset=utf-8')
  scrapeByAsin(@Res() reply: Response,@Req() req, @Param() params: FindAsin): any {

     this.productsService.scrapeByAsin(params.asin).subscribe((response$: any) => {

        reply.send(response$);

      }, error => {
        reply.send(error);
      },
    );

  }

  @Get('/asin-responses/:idRequest')
  @Header('Content-Type', 'application/json; charset=utf-8')
  scrapeByAsinResponse(@Res() reply: Response, @Req() req, @Param() params: FindIdRequest) {

    this.productsService.scrapeResponse(params.idRequest).subscribe((response$: any) => {

        reply.send(response$);

      }, error => {
        reply.send(error);
      },
    );

  }


}

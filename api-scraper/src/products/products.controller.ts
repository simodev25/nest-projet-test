import { Controller, Get, Header, Param, Req, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Response } from 'express';


@Controller('/products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) {


  }

  @Get('/:searchWord')
  scrapeSearchWordLite(@Req() req, @Param('searchWord') searchWord: string) {

    return this.productsService.scrapeSearchWordLite(searchWord);

  }

  @Get('/asnc/:searchWord')
  scrapeSearchWordAsync(@Req() req, @Param('searchWord') searchWord: string): any {

    return this.productsService.scrapeSearchWordAsync(searchWord);

  }

  @Get('/scrapeSearchWordAsyncResponse/:idRequest')
  scrapeSearchWordAsyncResponse(@Res() reply: Response, @Req() req, @Param('idRequest') idRequest: string) {

     this.productsService.scrapeResponse(idRequest).subscribe((response$: any) => {

      reply.send(response$);

      },
    );

  }

  @Get('/asin/:asin')
  scrapeByAsin(@Req() req, @Param('asin') asin: string): any {

    return this.productsService.scrapeByAsin(asin);

  }

  @Get('/scrapeByAsinResponse/:idRequest')
  @Header('Content-Type', 'application/json; charset=utf-8')
  scrapeByAsinResponse(@Res() reply: Response,@Req() req, @Param('idRequest') idRequest: string) {

     this.productsService.scrapeResponse(idRequest).subscribe((response$: any) => {

         reply.send(response$);

       },
     );

  }


}

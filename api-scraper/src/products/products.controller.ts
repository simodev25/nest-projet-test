import { Controller, Get, Inject, Injectable, Param, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/products')
export class ProductsController {

  constructor(@Inject('ScraperProxyFactory') private readonly scraperClient: ClientProxy) {


  }

  @Get('/:searchWord')
  scrapeSearchWordLite(@Req() req, @Param('searchWord') searchWord: string) {
    const pattern = { cmd: 'scrapeSearchWordLite' };


    return this.scraperClient.send<any>(pattern, searchWord);

  }

  @Get('/asnc/:searchWord')
  scrapeSearchWordAsync(@Req() req, @Param('searchWord') searchWord: string) {
    const pattern = { cmd: 'scrapeSearchWordAsync' };


    return this.scraperClient.send<any>(pattern, searchWord);

  }


}

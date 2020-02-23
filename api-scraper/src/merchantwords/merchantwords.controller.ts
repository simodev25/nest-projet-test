import { Controller, Get, Inject, Param, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/merchantwords')
export class MerchantwordsController {

  constructor(@Inject('ScraperProxyFactory') private readonly scraperClient: ClientProxy) {


  }

  @Get()
  merchantwords() {
    console.log('in merchantwords')
    console.log('-----------------------------------')
    const pattern = { cmd: 'merchantwords' };


    return this.scraperClient.send<any>('merchantwords', 'Hello World');

  }
}

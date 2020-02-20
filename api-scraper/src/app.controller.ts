import { Controller, Get, Inject, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('ClientProxyFactory') private readonly client: ClientProxy) {
  }

  @Get()
  getHello(@Req() req) {
    const pattern = { cmd: 'getProducts' };
    const store = 'store1';

    return this.client.send<any>(pattern, { store: 'store1', originalUrl: req.originalUrl });

  }
}

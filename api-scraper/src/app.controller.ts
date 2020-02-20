import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,@Inject('ClientProxyFactory') private readonly client: ClientProxy) {}

  @Get()
  getHello() {
    const pattern = { cmd: 'getProducts' };

    return this.client.send<any>(pattern, { });

  }
}

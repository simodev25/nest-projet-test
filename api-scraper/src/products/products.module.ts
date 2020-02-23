import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[ ClientsModule.register([
    {
      name: 'ScraperProxyFactory',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'scraper_service',
        queueOptions: {
          durable: false,
        },
      },
    },
  ])],
  controllers: [ProductsController],
  providers: [],
})
export class ProductsModule {

}

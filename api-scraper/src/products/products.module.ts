import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: 'ScraperProxyFactory',
      useFactory: () => {

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: 5667,
            host: 'scraper-microservice',
          },
        });
      },
    }],
})
export class ProductsModule {

}

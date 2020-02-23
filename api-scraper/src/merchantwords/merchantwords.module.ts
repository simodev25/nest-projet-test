import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MerchantwordsController } from './merchantwords.controller';

@Module({
  controllers: [MerchantwordsController],
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
export class MerchantwordsModule {

}

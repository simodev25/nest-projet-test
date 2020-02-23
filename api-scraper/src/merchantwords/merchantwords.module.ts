import { Module } from '@nestjs/common';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { MerchantwordsController } from './merchantwords.controller';

@Module({
  imports: [
    ClientsModule.register([
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
  controllers: [MerchantwordsController],
  providers: [],
})
export class MerchantwordsModule {

}

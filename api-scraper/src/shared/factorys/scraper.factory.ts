import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';


export const getScraperProxyFactory = () => {
  return {
    provide: 'ScraperProxyFactory',
    useFactory: (configService: ConfigService) => {
      const guestUrl = configService.get('AMQP_URL');
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [guestUrl],
          queue: 'scraper_service',
          queueOptions: {
            durable: false,
          },
        },
      });
    },
    inject: [ConfigService],
  };
};

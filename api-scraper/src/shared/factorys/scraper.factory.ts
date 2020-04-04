import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';


export const getScraperProxyFactory = () => {
  return {
    provide: 'ScraperProxyFactory',
    useFactory: (configService: ConfigService) => {
      const guestUrls = configService.get<string>('AMQP_URL').split(',');
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: guestUrls,
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


export const getUrlScraperProxyFactory = () => {
  return {
    provide: 'UrlScraperProxyFactory',
    useFactory: (configService: ConfigService) => {
      const guestUrls = configService.get<string>('AMQP_URL').split(',');
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: guestUrls,
          queue: 'url_scraper_service',
          queueOptions: {
            durable: false,
          },
        },
      });
    },
    inject: [ConfigService],
  };
};

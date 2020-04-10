import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const urlScraperMicroservice = await NestFactory.create(AppModule);

  const guestUrls = urlScraperMicroservice.get(ConfigService).get<string>('AMQP_URL').split(',');
  urlScraperMicroservice.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: guestUrls,
      queue: 'url_scraper_service',
      queueOptions: {
        durable: false,
      },
    },
  });
  await urlScraperMicroservice.startAllMicroservicesAsync();

}

bootstrap();

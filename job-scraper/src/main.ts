import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ScraperModule } from './scraper/scraper.module';

async function bootstrap() {
  const scraperModule = await NestFactory.createMicroservice(ScraperModule, {
    transport: Transport.TCP,
  });
  scraperModule.listen(() => console.log('scraper Microservice is listening'));
}

bootstrap();

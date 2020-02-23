import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule,
    new FastifyAdapter({ logger: true })
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.use(helmet());
  await app.listen(3000);
}
bootstrap();

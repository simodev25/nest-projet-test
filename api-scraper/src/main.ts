import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as helmet from 'fastify-helmet';
import { AnyExceptionFilter } from './shared/Exception/anyExceptionFilter';
import { ValidationPipe } from '@nestjs/common';
import { ErrorFilter } from './shared/Exception/errorFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiRequestExceptionFilter } from './shared/Exception/api.request.exception.filter';

async function bootstrap() {

  const globalPrefix: string = 'api/v1';
  const fastifyAdapter = new FastifyAdapter();

  const fastify = await NestFactory.create<NestFastifyApplication>(AppModule,
    fastifyAdapter,
  );

  fastify.setGlobalPrefix(globalPrefix);
  fastify.enableCors();
  fastify.register(
    helmet,
    // Example of passing an option to x-powered-by middleware
    { hidePoweredBy: { setTo: 'PHP 4.2.0' } },
  );

  fastify.register(require('fastify-rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
  });
  fastify.register(require('fastify-server-timeout'), {
    serverTimeout: 10000, //ms
  });

  fastify.useGlobalFilters(new ErrorFilter());
  fastify.useGlobalFilters(new AnyExceptionFilter());
  fastify.useGlobalFilters(new ApiRequestExceptionFilter());

  fastify.useGlobalPipes(new ValidationPipe());


  const options = new DocumentBuilder()
    .setTitle('supermerchant api')
    .setDescription('api.supermerchant.io  is the reliable, real-time search results API you\'ve been looking for')
    .setVersion('1.0')
   // .setContact('bensassai.mohammed', null, 'bensassai.mohammed@gmail.com')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(fastify, options);
  SwaggerModule.setup(`${globalPrefix}/swagger/products`, fastify, document);


  await fastify.listen(3000, '0.0.0.0');
}

bootstrap();

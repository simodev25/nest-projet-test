import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as helmet from 'fastify-helmet';
import { AnyExceptionFilter } from './shared/Exception/anyExceptionFilter';
import { ValidationPipe } from '@nestjs/common';
import { ErrorFilter } from './shared/Exception/errorFilter';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.setErrorHandler((error, request, reply) => {
    console.log('getHttpAdapter')
    reply.code(200).send('Alright!');
  });

  const fastify = await NestFactory.create<NestFastifyApplication>(AppModule,
    fastifyAdapter,
  );

  fastify.setGlobalPrefix('api/v1');
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
    serverTimeout: 100, //ms
  });

  fastify.useGlobalFilters(new ErrorFilter());
  fastify.useGlobalFilters(new AnyExceptionFilter());
  fastify.useGlobalPipes(new ValidationPipe());

  await fastify.listen(3000, '0.0.0.0', (err, address) => {
    if (err) console.log(err)
    console.log(`Server listening on ${address}`)
  })
}

bootstrap();

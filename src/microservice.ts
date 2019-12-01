import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProduitsModule } from './produits/produits.module';
import { Transport } from '@nestjs/common/enums/transport.enum';
import { ValidationFiltre } from './tasks/filters/validation-filtre';
import { ExceptionFactory } from './shared/exception-factory';

async function microservice() {

  const log = new Logger('microservice.ts')

  const produitMicroservice = await NestFactory.createMicroservice(ProduitsModule, {
    transport: Transport.REDIS,
    options: {
      url: 'redis://127.0.0.1:6379'
    },
  });



  await produitMicroservice.listen(() => {

    log.verbose('microservice successfully started');
  })

}

microservice();

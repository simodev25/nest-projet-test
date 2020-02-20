import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,{
    provide: 'ClientProxyFactory',
    useFactory: () => {

      return ClientProxyFactory.create({
        transport: Transport.TCP,

      });
    },
  },],
})
export class AppModule {}

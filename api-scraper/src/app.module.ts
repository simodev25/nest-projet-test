import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: 'ScraperProxyFactory',
      useFactory: () => {

        return ClientProxyFactory.create({
          transport: Transport.TCP,

        });
      },
    }],
})
export class AppModule {
}

import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { SharedModule } from '../shared/shared.module';
import { ProductsService } from './products.service';
import { ResponseHelper } from './response/response.helper';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [SharedModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          url: configService.get('REDIS_URL'),
        };
      },

      inject: [ConfigService],
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ResponseHelper],
})
export class ProductsModule {

}

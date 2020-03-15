import { CacheModule, Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { SharedModule } from '../shared/shared.module';
import { ProductsService } from './products.service';
import { ResponseHelper } from './response/response.helper';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { ClusterRedisService } from '../shared/services/cluster.redis.service';

@Module({
  imports: [SharedModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        if(process.env.NODE_ENV === 'production') {
          return [];
        }
        return [{
          retryAttempts: 5,
          retryDelay: 1000,
          url: configService.get('REDIS_URL'),
        }];
      },

      inject: [ConfigService],
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ResponseHelper, ClusterRedisService],
})
export class ProductsModule {

}

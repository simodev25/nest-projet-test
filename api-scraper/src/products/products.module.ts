import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { SharedModule } from '../shared/shared.module';
import { ProductsService } from './products.service';
import { ResponseHelper } from './response/response.helper';
import { RedisModule, RedisModuleOptions } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { ClusterRedisService } from '../shared/services/cluster.redis.service';

@Module({
  imports: [SharedModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisConfigs: RedisModuleOptions[] = [];
        const urls: string[] = configService.get<string>('REDIS_URL').split(',');
        urls.forEach((url: string, index: number) => {
          redisConfigs.push({
            name: `redis-${index}`,
            url,
            db: 0,
            readOnly: true,
          });
        });
        return redisConfigs;
      },

      inject: [ConfigService],
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ResponseHelper, ClusterRedisService],
})
export class ProductsModule {

}

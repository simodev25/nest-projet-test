import { RedisService } from 'nestjs-redis';
import { Inject, Injectable } from '@nestjs/common';


import * as Redis from 'ioredis';
import { Cluster } from 'ioredis';

@Injectable()
export class ClusterRedisService {

  private cluster: Cluster;

  constructor(private  redisService: RedisService) {
    const servers: any[] = [{
      host: 'redis-0.redis-discovery',
      port: 6379, password: 'REDIS_PASS',
    }, {
      host: 'redis-1.redis-discovery',
      port: 6379, password: 'REDIS_PASS',
    },
      {
        host: 'redis-2.redis-discovery',
        port: 6379, password: 'REDIS_PASS',
      },
      {
        host: 'redis-3.redis-discovery',
        port: 6379, password: 'REDIS_PASS',
      }, {
        host: 'redis-4.redis-discovery',
        port: 6379, password: 'REDIS_PASS',
      }
      , {
        host: 'redis-5.redis-discovery',
        port: 6379, password: 'REDIS_PASS',
      },

    ];

    this.cluster = new Redis.Cluster(servers, {

    });
  }

  public getCluster(): Cluster {


    return this.cluster;
  }

  public getClient(): Cluster | Redis.Redis {

    console.log('NODE_ENV', process.env.NODE_ENV)
    return process.env.NODE_ENV === 'production' ? this.getCluster() : this.redisService.getClient();

  }

}

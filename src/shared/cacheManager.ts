import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';


@Injectable()
export class CacheManager {
  constructor(@Inject(CACHE_MANAGER) private cacheManager) {


      // handle error here
      // listen for redis connection error event
      const redisClient = this.cacheManager.store.getClient();

      redisClient.on('error', (error) => {
        // handle error here
        console.log(error);
      });

    }


  public cleanTasksCache(){

    this.cacheManager.del('/tasks', () => console.log('clear done'));

  }

}

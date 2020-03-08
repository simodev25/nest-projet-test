import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ClusterRedisService } from '../services/cluster.redis.service';
import { deserialize, serialize } from 'class-transformer';
import { stringToHashCode } from '../utils/shared.utils';
import { Merchantwords } from '../../products/product/merchantwords';

@Injectable()
export class CacheInterceptor implements NestInterceptor {

  constructor(private clusterRedisService: ClusterRedisService,
  ) {
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {

    const request: any = context.switchToHttp().getRequest();
    const key: string = stringToHashCode(request.params);

    if (!key) {
      return next.handle();
    }
    try {
      const value = await this.clusterRedisService.getClient().get(key);
      if (value) {
        return of(deserialize(Merchantwords, value));
      }

      return next.handle().pipe(
        tap(response => {

          this.clusterRedisService.getClient().set(key, serialize(response));
          this.clusterRedisService.getClient().expire(key, 60 * 60 * 24);
        }),
      );
    } catch {
      return next.handle();
    }
  }


}
